# MS Gestión de Bloqueos de Cabinas — Diseño

**Fecha:** 2026-05-18  
**Versión:** 1.0  
**Stack:** Go 1.20 · Gin · MongoDB · Arquitectura Hexagonal  
**Contexto:** Sistema de bloqueos para Galápagos Travel Center (GTC). Gestiona la disponibilidad de cabinas de cruceros entre el operador (Royal/GTC) y agencias de viaje.

---

## 1. Contexto y Problema

Los cruceros en Galápagos operan con barcos que tienen un inventario fijo de cabinas. Por cada salida (viaje específico del barco), las agencias de viaje pueden bloquear cabinas temporalmente para sus clientes. El sistema debe garantizar que:

- No se puedan bloquear ni reservar cabinas ya ocupadas o bloqueadas.
- Cuando no hay disponibilidad directa, las agencias puedan entrar en lista de espera.
- El estado de cada booking refleje fielmente la combinación de estados de sus cabinas.
- Exista trazabilidad completa de cada cambio de estado.

---

## 2. Flujo de Negocio

### Caso A — Disponibilidad directa (cabinas DISPONIBLE)

```
Agencia solicita bloqueo
        │
        ▼
Sistema verifica disponibilidad en la salida
        │
   Hay DISPONIBLES
        │
        ▼
Operador bloquea N cabinas → estado booking: ON HOLD
        │
   ┌────┼──────────────┐
   │    │              │
8 días  confirma    libera/cancela
expira  │              │
   │    ▼              ▼
   │  CONFIRMED   HOLD RELEASED
   ▼              (cabinas → DISPONIBLE)
HOLD RELEASED
(cabinas → DISPONIBLE)
```

### Caso B — Sin disponibilidad directa (todas bloqueadas o confirmadas)

```
Agencia solicita bloqueo
        │
        ▼
Sistema verifica: no hay DISPONIBLE pero hay ON HOLD
        │
        ▼
Solicitud queda en PENDING (lista de espera, sin expiración)
        │
   Algún ON HOLD se libera (Hold Released)
        │
        ▼
Operador ve lista de espera y asigna manualmente
        │
        ▼
Estado booking pasa a ON HOLD → flujo normal (Caso A)
```

### Caso C — Sin disponibilidad ni bloqueos

```
No hay DISPONIBLE ni ON HOLD → solicitud RECHAZADA
```

### Estados compuestos al cancelar/liberar cabinas individuales

```
CONFIRMED
  ├─ cancela algunas cabinas         → CANCELLED, CONFIRMED
  │    └─ libera sus holds           → CANCELLED, CONFIRMED, HOLD RELEASED
  └─ libera holds de confirmadas     → CONFIRMED, HOLD RELEASED
```

---

## 3. Máquina de Estados

### Estado de CabinaSalida (cabina en una salida específica)

| Estado | Descripción |
|---|---|
| `DISPONIBLE` | Libre para bloquear o reservar |
| `BLOQUEADA` | Retenida por un booking ON HOLD |
| `CONFIRMADA` | Vendida/confirmada |

**Transiciones:**
```
DISPONIBLE → BLOQUEADA      (al crear ON HOLD)
BLOQUEADA  → DISPONIBLE     (al expirar/liberar hold)
BLOQUEADA  → CONFIRMADA     (al confirmar booking)
CONFIRMADA → DISPONIBLE     (al cancelar cabina confirmada y liberar hold)
```

### Estado del Booking

| Estado en DB | Visible en UI | Descripción |
|---|---|---|
| `PENDING` | Pending | En lista de espera (sin cabinas bloqueadas) |
| `ON_HOLD` | On Hold | Cabinas bloqueadas, pendiente de confirmación |
| `CONFIRMED` | Confirmed | Todas las cabinas confirmadas |
| `HOLD_RELEASED` | Cancelled | Hold liberado sin venta |
| `CANCELLED_CONFIRMED` | Cancelled | Venta con cabinas canceladas |
| `CONFIRMED_HOLD_RELEASED` | Confirmed | Venta con holds liberados |
| `CANCELLED_CONFIRMED_HOLD_RELEASED` | Cancelled | Venta cancelada con holds liberados |

**Regla de cálculo:** El `estado_booking` se recalcula automáticamente cada vez que cambia el `estado_individual` de cualquier `BookingCabina` que pertenece al booking.

---

## 4. Modelo de Datos (MongoDB)

### Colección: `barcos`
```json
{
  "_id": "ObjectID",
  "nombre": "string",
  "codigo": "string",
  "capacidad_cabinas": "int",
  "descripcion": "string",
  "activo": "bool",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Colección: `cabinas`
```json
{
  "_id": "ObjectID",
  "barco_id": "ObjectID",
  "numero": "string",
  "tipo": "SIMPLE | DOBLE | SUITE | TRIPLE",
  "deck": "string",
  "precio_base": "float64",
  "capacidad_pax": "int",
  "activo": "bool"
}
```

### Colección: `salidas`
```json
{
  "_id": "ObjectID",
  "barco_id": "ObjectID",
  "codigo_salida": "string",
  "itinerario": "string",
  "fecha_salida": "date",
  "fecha_retorno": "date",
  "estado": "ACTIVA | CANCELADA | CERRADA",
  "created_at": "timestamp"
}
```

### Colección: `cabinas_salida` (inventario por salida)
```json
{
  "_id": "ObjectID",
  "cabina_id": "ObjectID",
  "salida_id": "ObjectID",
  "precio": "float64",
  "estado": "DISPONIBLE | BLOQUEADA | CONFIRMADA",
  "updated_at": "timestamp"
}
```
> Índice único compuesto: `{cabina_id, salida_id}`

### Colección: `bookings`
```json
{
  "_id": "ObjectID",
  "agencia_id": "string",
  "salida_id": "ObjectID",
  "estado": "PENDING | ON_HOLD | CONFIRMED | HOLD_RELEASED | CANCELLED_CONFIRMED | CONFIRMED_HOLD_RELEASED | CANCELLED_CONFIRMED_HOLD_RELEASED",
  "fecha_solicitud": "timestamp",
  "fecha_expiracion": "timestamp",
  "dias_plazo": "int (default: 8)",
  "operador_id": "string",
  "notas": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Colección: `bookings_cabinas`
```json
{
  "_id": "ObjectID",
  "booking_id": "ObjectID",
  "cabina_salida_id": "ObjectID",
  "estado_individual": "ON_HOLD | CONFIRMED | HOLD_RELEASED | CANCELLED",
  "precio_aplicado": "float64",
  "updated_at": "timestamp"
}
```

### Colección: `historial_estados`
```json
{
  "_id": "ObjectID",
  "entidad": "BOOKING | CABINA_SALIDA",
  "entidad_id": "ObjectID",
  "estado_anterior": "string",
  "estado_nuevo": "string",
  "usuario_id": "string",
  "motivo": "string",
  "fecha": "timestamp"
}
```

---

## 5. API REST

### Barcos y Cabinas
```
GET    /barcos                          → listar barcos
POST   /barcos                          → crear barco
GET    /barcos/:id/cabinas              → cabinas de un barco
POST   /cabinas                         → crear cabina
```

### Salidas
```
GET    /salidas                         → listar salidas (filtros: barco, fecha)
POST   /salidas                         → crear salida
GET    /salidas/:id/disponibilidad      → cabinas con estado por salida
POST   /salidas/:id/inicializar-cabinas → crear CabinaSalida para todas las cabinas del barco
```

### Bookings (núcleo del MS)
```
POST   /bookings                        → crear booking (evalúa disponibilidad → ON_HOLD o PENDING)
GET    /bookings                        → listar bookings (filtros: estado, agencia, salida)
GET    /bookings/:id                    → detalle booking + cabinas
PUT    /bookings/:id/confirmar          → ON_HOLD → CONFIRMED
PUT    /bookings/:id/liberar            → ON_HOLD → HOLD_RELEASED
PUT    /bookings/:id/cancelar-cabina    → cancela cabina individual dentro del booking
PUT    /bookings/:id/liberar-cabina     → libera cabina individual confirmada
PUT    /bookings/:id/asignar-desde-espera → PENDING → ON_HOLD (operador asigna manualmente)

# Job interno
POST   /internal/bookings/expirar       → expira ON_HOLD vencidos (scheduler cada hora)
```

---

## 6. Reglas de Negocio

| # | Regla |
|---|---|
| R1 | Al crear un booking: si hay `DISPONIBLE` → `ON_HOLD`; si hay `ON_HOLD` pero no `DISPONIBLE` → `PENDING`; si no hay ninguno → error 409 |
| R2 | Una cabina `BLOQUEADA` o `CONFIRMADA` no puede ser tomada por otro booking |
| R3 | `ON_HOLD` expira en 8 días (configurable por booking). Al expirar → `HOLD_RELEASED` y cabinas → `DISPONIBLE` |
| R4 | `PENDING` no expira. Queda activo hasta que el operador lo gestione o la agencia lo cancele |
| R5 | Cuando un hold se libera, el operador ve la lista de `PENDING` y decide manualmente a quién asignar |
| R6 | El `estado` del booking se recalcula automáticamente al cambiar cualquier `BookingCabina` |
| R7 | Toda transición de estado queda registrada en `historial_estados` con usuario, fecha y motivo |
| R8 | Un booking puede incluir múltiples cabinas de la misma salida en una sola operación |

---

## 7. Arquitectura del MS (Hexagonal)

```
booking-ms/
├── cmd/
│   └── api/main.go
├── config/
│   └── config.go
├── internal/
│   ├── domain/
│   │   ├── models.go          (Barco, Cabina, Salida, CabinaSalida, Booking, BookingCabina, HistorialEstado)
│   │   └── states.go          (constantes de estado + lógica de recálculo)
│   ├── ports/
│   │   └── ports.go           (interfaces de repositorios y servicios)
│   ├── usecase/
│   │   ├── booking_usecase.go
│   │   ├── disponibilidad_usecase.go
│   │   └── expiracion_usecase.go
│   └── adapters/
│       ├── http/
│       │   ├── router.go
│       │   └── handlers/
│       │       ├── barco_handlers.go
│       │       ├── salida_handlers.go
│       │       ├── booking_handlers.go
│       │       └── disponibilidad_handlers.go
│       └── mongo/
│           ├── conn.go
│           ├── repo_barco.go
│           ├── repo_cabina.go
│           ├── repo_salida.go
│           ├── repo_cabina_salida.go
│           ├── repo_booking.go
│           └── repo_historial.go
├── Dockerfile
├── docker-compose.yml
├── go.mod
└── .env.example
```

---

## 8. Consideraciones Técnicas

- **Concurrencia:** Al bloquear cabinas, usar transacciones MongoDB (multi-document) para evitar doble bloqueo de la misma cabina.
- **Scheduler:** Job de expiración implementado con `time.Ticker` o cron interno en Go. Se ejecuta cada hora y revisa bookings `ON_HOLD` vencidos.
- **Recálculo de estado:** La función `RecalcularEstadoBooking(cabinas []BookingCabina) string` vive en `domain/states.go` — es pura y testeable sin DB.
- **Índices MongoDB:** Índice en `{salida_id, estado}` en `cabinas_salida` para consultas de disponibilidad eficientes.
