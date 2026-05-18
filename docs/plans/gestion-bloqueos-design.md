# Gestión de Bloqueos de Cabinas — Documento Funcional

**Proyecto:** Galápagos Travel Center (GTC)
**Proceso:** Gestión de disponibilidad y bloqueos de cabinas de cruceros
**Versión:** 4.0 — Verificada contra código fuente Java (back-end) y JSF/PrimeFaces (front-end)
**Audiencia:** Dueño del proceso / Operaciones

---

## 1. ¿De qué trata este proceso?

El sistema permite que las agencias de viaje bloqueen temporalmente cabinas en cruceros de Galápagos. El operador (Royal/GTC) administra esas solicitudes: confirma ventas, libera espacios, gestiona listas de espera y controla el mantenimiento de cabinas.

---

## 2. Actores del proceso

| Actor        | Qué hace                                                              |
|--------------|-----------------------------------------------------------------------|
| **Agencia**  | Solicita bloqueos, entra en lista de espera, confirma o libera        |
| **Operador** | Administra disponibilidad, aprueba, asigna listas de espera, mantiene |
| **Sistema**  | Expira bloqueos automáticamente, notifica, recalcula disponibilidad   |

---

## 3. Conceptos clave

| Término               | Qué es                                                                              |
|-----------------------|-------------------------------------------------------------------------------------|
| **Barco**             | El crucero físico con sus características                                           |
| **Cabina**            | Espacio físico del barco (simple, doble, suite, triple)                             |
| **Itinerario / Salida** | Un viaje específico con fechas de salida y retorno                               |
| **Espacio**           | Cada lugar individual dentro de una cabina (ej: cabina doble = 2 espacios)         |
| **Pedido**            | Solicitud de bloqueo o reserva de una agencia para un itinerario                   |
| **Grupo**             | Conjunto de pedidos de la misma agencia para el mismo itinerario (mismo código)    |
| **Cuota**             | Límite de bloqueos que puede realizar un usuario por mes/año                       |
| **Modo FIT**          | Reserva individual por pasajero                                                     |
| **Modo Charter**      | Reserva del barco completo o grupo grande                                           |
| **WL**                | Waiting List — lista de espera cuando no hay disponibilidad directa                 |

---

## 4. Estados de un pedido

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ESTADOS EN BASE DE DATOS                        │
│                                                                     │
│  Código 2  → LISTA DE ESPERA (Pending)  [sin cabina asignada]       │
│  Código 167→ ON HOLD principal          [cabina bloqueada]          │
│  Código 177→ ON HOLD secundario         [cabinas afectadas]         │
│  Código 185→ CONFIRMED principal        [venta confirmada]          │
│  Código 274→ CONFIRMED secundario                                   │
│  Código 168→ MANTENIMIENTO principal    [cabina cerrada]            │
│  Código 303→ MANTENIMIENTO secundario                               │
│  Código 1777→ CANCELLED, CONFIRMED principal                        │
│  Código 1778→ CANCELLED, CONFIRMED secundario                       │
│  Código 2583→ HOLD RELEASED principal   [liberado]                  │
│  Código 2584→ HOLD RELEASED secundario                              │
│  Código 2628→ CONFIRMED PENDIENTE       [confirmado sin completar]  │
│  Código 2629→ CONFIRMED PENDIENTE secundario                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    LO QUE VE EL USUARIO EN PANTALLA                 │
│                                                                     │
│  On Hold             → Cabina bloqueada para la agencia             │
│  Pending             → En lista de espera                           │
│  In Process          → Bloqueo en proceso de confirmación           │
│  Time Limit          → Bloqueo próximo a vencer                     │
│  Confirmed           → Venta confirmada                             │
│  Confirmed Pending   → Confirmado pero sin completar datos          │
│  Cancel Confirmation → Confirmación cancelada (aún sin liberar)     │
│  Expired / Caducado  → Liberado automáticamente por vencimiento     │
│  Grouped / Agrupado  → Pedidos del mismo grupo                      │
│  Cancelled           → Cancelado (varias combinaciones internas)    │
└─────────────────────────────────────────────────────────────────────┘
```

> **Nota:** Cada estado tiene una variante **principal** (para la cabina directamente bloqueada)
> y una **secundaria** (para cabinas del mismo barco afectadas por solape de fechas).

---

## 5. Flujo 1 — Bloqueo directo (ON HOLD)

**Cuándo aplica:** Hay espacios libres en el itinerario.

```
  AGENCIA                        SISTEMA                      OPERADOR
     │                              │                              │
     │── Selecciona itinerario ─────►│                              │
     │   y cabinas + pax            │                              │
     │                              │                              │
     │                        Valida disponibilidad:               │
     │                        ┌─────────────────────┐             │
     │                        │ ¿pax nuevo +         │             │
     │                        │  pax existente       │             │
     │                        │  < capacidad cabina? │             │
     │                        └──────────┬──────────┘             │
     │                                   │                         │
     │                        ┌──────────▼──────────┐             │
     │                        │ ¿total pax itiner.   │             │
     │                        │  <= disponibles      │             │
     │                        │  del barco?          │             │
     │                        └──────────┬──────────┘             │
     │                                   │ SÍ                      │
     │                        Calcula fecha vencimiento:           │
     │                        (según parámetro TIPO_MAX_BLOQUEO    │
     │                         de la empresa + ajuste fin semana)  │
     │                                   │                         │
     │                        Crea Pedido estado ON HOLD           │
     │                        Crea Bloqueo PRINCIPAL (167)         │
     │                        Crea Bloqueos SECUNDARIOS (177)      │
     │                        en cabinas del mismo barco           │
     │                        con fechas solapadas                 │
     │                                   │                         │
     │◄── Notificación por mail ─────────│                         │
     │    con fecha vencimiento          │                         │
     │                                   │──── Notificación ──────►│
                                                  ON HOLD
```

**Reglas verificadas en código:**
- La validación suma `adultos + niños` de todos los bloqueos activos de esa cabina
- Si `suma >= capacidad cabina` → error: *"This cabin has no spaces available"*
- Si `total pax > itinerario.disponibles` → error: *"You have reached the maximum number of passengers for this boat"*
- La fecha de vencimiento se ajusta: sábado → +2880 min, domingo → +1440 min
- El primer pedido del grupo define el `codigo_grupo`; los siguientes lo heredan

---

## 6. Flujo 2 — Lista de espera (PENDING / Waiting List)

**Cuándo aplica:** No hay cabinas disponibles pero sí hay bloqueos activos.

```
  AGENCIA                        SISTEMA                      OPERADOR
     │                              │                              │
     │── Solicita bloqueo ──────────►│                              │
     │                              │                              │
     │                        No hay DISPONIBLE                    │
     │                        pero hay ON HOLD                     │
     │                              │                              │
     │                        Crea Pedido tipo WL                  │
     │                        estadoPedido = 2                     │
     │                        Asigna fecha de vencimiento          │
     │                        Incrementa contador WL               │
     │                        del itinerario en +1                 │
     │                              │                              │
     │◄── Notificación WL ──────────│──── Alerta WL nueva ────────►│
     │    (si catálogo                                             │
     │    NOTIFICACION_LISTAESPERA                                 │
     │    = "true")                                                │
     │                              │                              │
     │                   [Algún ON HOLD se libera]                 │
     │                              │                              │
     │                              │──── Lista de espera ────────►│
     │                              │     disponible               │
     │                              │                              │
     │                              │◄─── Operador asigna ────────│
     │                              │     manualmente el espacio   │
     │                              │                              │
     │                        WL antiguo se inactiva               │
     │                        dadoBajaUsuario =                    │
     │                        "SE CONVIERTE A PEDIDO"              │
     │                              │                              │
     │                        Nuevo Pedido ON HOLD                 │
     │                        hereda fecha vencimiento del WL      │
     │◄── Notificación ON HOLD ─────│                              │
```

**Reglas verificadas en código:**
- El WL tiene su propia fecha de caducidad (`fechaCaduca`)
- Al convertir WL a ON HOLD, los bloqueos en espera de las cabinas se eliminan
- El código del WL queda registrado en el nuevo pedido (`codigowl`)
- Para eliminar WL manualmente: `estadoPedido = 3`, `estado = inactivo`

---

## 7. Flujo 3 — Confirmación de venta

**Cuándo aplica:** La agencia decide confirmar la compra estando en ON HOLD.

```
  AGENCIA                        SISTEMA                      OPERADOR
     │                              │                              │
     │                              │◄──── Confirmar pedidos ─────│
     │                              │      del grupo               │
     │                              │      + indicar boletos       │
     │                              │                              │
     │                        Cambia BloqueoEspacios:              │
     │                        167 → 185 (principal)                │
     │                        177 → 274 (secundario)               │
     │                              │                              │
     │                        Crea PedidoPasajero                  │
     │                        por cada adulto y niño               │
     │                              │                              │
     │                        Crea Pasajero vacío                  │
     │                        (se completará después)              │
     │                              │                              │
     │                        Calcula tarifas finales              │
     │                        (stored procedure)                   │
     │                              │                              │
     │                        Registra fechaConfirmacion           │
     │◄── Mail confirmación ────────│                              │
```

**Al confirmar, si el pasajero NO desea boleto aéreo:**
```
→ Se aplica cargo: $50 × número de pasajeros sin boleto
  Descripción: "Penalty fee for the Galapagos air tickets not-issued"
```

**Opción de boletos del pasajero:**
```
  1679 = Desea boleto aéreo
  1683 = No desea boleto aéreo
         └─ Genera cargo extra de $50/pax
```

### 7.1 Asistente de confirmación (4 pasos)

Después de iniciar la confirmación, el operador completa los datos en 4 pasos en pantalla:

```
┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌──────────┐
│  Paso 1  │───►│    Paso 2     │───►│    Paso 3    │───►│  Paso 4  │
│Pasajeros │    │  Servicios    │    │    Vuelos    │    │ Resumen  │
│          │    │ Adicionales   │    │  (Boletos)   │    │ Final    │
└──────────┘    └───────────────┘    └──────────────┘    └──────────┘
```

**Paso 1 — Datos de pasajeros:**
- Nombre, apellido, género, estado civil
- Fecha de nacimiento, nacionalidad
- Número de pasaporte
- Observaciones especiales
- *Validaciones:* edad vs tipo de pasajero (adulto/niño), formato pasaporte
- *Restricción:* edición bloqueada si ya se emitieron boletos o tras ventana de edición

**Paso 2 — Servicios adicionales:**
- Selección de servicios disponibles por pasajero
- Fechas de servicio, tipo (sí/no/gratuito)
- *Regla:* si se cambia nacionalidad o edad → servicios se eliminan automáticamente

**Paso 3 — Boletos aéreos:**
```
  Opciones por pasajero:
  ├─ Sin boleto              → cargo $50/pax
  ├─ Fechas del crucero      → mismo itinerario
  ├─ Fechas fuera del crucero→ fechas libres
  ├─ Solo ida                → one-way
  └─ Ida y vuelta            → roundtrip
```
- *Restricción:* edición bloqueada si boleto ya fue emitido
- *Regla:* si se cambia nombre/pasaporte/edad → boletos se recalculan automáticamente

**Paso 4 — Resumen final:**
- Totales de alojamiento y extras
- Visibilidad de cargos por cancelación
- Acceso a voucher, proforma, factura

---

## 8. Flujo 4 — Liberación de bloqueo (Hold Release)

**Cuándo aplica:** Se libera el espacio sin confirmar venta.

```
  AGENCIA / OPERADOR             SISTEMA
        │                           │
        │── Solicita liberar ───────►│
        │   pedido(s)               │
        │                     Cambia BloqueoEspacios:
        │                     167 → 2583 (HOLD RELEASED principal)
        │                     177 → 2584 (HOLD RELEASED secundario)
        │                           │
        │                     En el pedido registra:
        │                     dadoBajaUsuario =
        │                     "[usuario] HD RELEASED"
        │                           │
        │                     Modo del grupo → FIT (160)
        │◄── Mail cancelación ──────│
```

---

## 9. Flujo 5 — Cancelación de confirmación

**Cuándo aplica:** Una venta confirmada debe cancelarse.

```
  OPERADOR                       SISTEMA
     │                              │
     │── Cancelar confirmación ─────►│
     │                              │
     │                        Cambia BloqueoEspacios:
     │                        185 → 1777 (CANCELLED, CONFIRMED)
     │                        274 → 1778 (CANCELLED, CONFIRMED sec.)
     │                              │
     │                        Inactiva PedidoPasajero
     │                        Inactiva extras del pedido
     │                        (excepto cargos de cancelación tipo 1780)
     │                              │
     │                        Registra fecha y usuario
```

---

## 10. Flujo 6 — Mantenimiento de cabina

**Cuándo aplica:** El operador necesita bloquear una cabina por motivos operativos.

```
  OPERADOR                       SISTEMA
     │                              │
     │── Cerrar cabina(s) ──────────►│
     │                              │
     │                        Crea pedido especial:
     │                        referencia = "MANTENIMIENTO"
     │                        adultos = 0, ninos = 0
     │                        fechaCaduca = fecha actual
     │                              │
     │                        Crea BloqueoEspacios con
     │                        estado MANTENIMIENTO (168)
     │                        y SECUNDARIO (303) para afectados
     │                              │
     │── Abrir cabina(s) ───────────►│
     │                              │
     │                        Inactiva BloqueoEspacios
     │                        de tipo MANTENIMIENTO
     │                        Inactiva/actualiza Bloqueos
```

---

## 11. Flujo 7 — Expiración automática

**El sistema ejecuta este proceso cada 3 minutos:**

```
┌────────────────────────────────────────────────────────┐
│  TIMER (cada 3 minutos)                                │
│                                                        │
│  Tarea A: Pedidos ON HOLD vencidos                     │
│  ──────────────────────────────────                    │
│  1. SP: timer_buscar_pedidos_caducados_notificados     │
│  2. Por cada pedido vencido:                           │
│     SP: timer_eliminar_pedido_caducado(pedido, false)  │
│  3. Recalcula contadores del itinerario                │
│                                                        │
│  Tarea B: Pedidos ON HOLD vencidos con WL              │
│  ──────────────────────────────────────────            │
│  1. SP: timer_buscar_pedidos_caducados_notificados_wl  │
│  2. Por cada pedido:                                   │
│     SP: timer_eliminar_pedido_caducado(pedido, true)   │
│  3. Recalcula contadores del itinerario                │
│                                                        │
│  Tarea C: Pedidos WL vencidos                          │
│  ───────────────────────────                           │
│  1. SP: timer_eliminar_pedidos_pendientes              │
│  2. Recalcula contadores del itinerario                │
│                                                        │
│  Tarea D: Color de cabinas (cada 5 min)                │
│  ──────────────────────────────────────                │
│  1. SP: timer_buscar_pedidos_eliminados                │
│  2. SP: timer_actualizar_color_cabina(pedido)          │
│  3. Recalcula contadores                               │
└────────────────────────────────────────────────────────┘
```

---

## 12. Flujo 8 — Extensión de plazo

```
  AGENCIA                        OPERADOR                   SISTEMA
     │                              │                           │
     │── Solicita extensión ─────────────────────────────────►│
     │                              │                    pedido.extencion = 24
     │                              │                    (pendiente de aprobación)
     │                              │                           │
     │                              │◄─── Ve solicitudes ───────│
     │                              │     pendientes             │
     │                              │                           │
     │                              │── Aprueba días/horas ────►│
     │                              │                           │
     │                              │                    fechaCaduca +=
     │                              │                    (dias×1440 + horas×60) min
     │                              │                    nroExtensiones++
     │                              │                    Registra fechaExtensionInicial
     │◄── Mail extensión ───────────────────────────────────────│
```

**Regla verificada:** Solo se puede extender si el pedido todavía no ha vencido.

---

## 13. Máquina de estados completa

```
                              ┌─────────┐
                              │DISPONIBLE│
                              └────┬────┘
                                   │ agencia solicita + hay espacios
                                   ▼
                             ┌──────────┐
              ┌──────────────│ ON HOLD  │──────────────┐
              │              │ (167/177)│              │
              │              └────┬─────┘              │
              │                   │                    │
         expira/libera        confirma             mantenimiento
              │                   │                    │
              ▼                   ▼                    ▼
       ┌─────────────┐    ┌────────────┐      ┌──────────────┐
       │HOLD RELEASED│    │ CONFIRMED  │      │ MAINTENANCE  │
       │(2583/2584)  │    │(185/274)   │      │ (168/303)    │
       └──────┬──────┘    └─────┬──────┘      └──────┬───────┘
              │                 │                    │
       cabinas                  │                 se abre
       → DISPONIBLE     ┌───────┴───────┐            │
                        │               │            ▼
                   cancela         libera holds  DISPONIBLE
                   cabinas         confirmadas
                        │               │
                        ▼               ▼
              ┌──────────────┐  ┌─────────────────────┐
              │  CANCELLED,  │  │   CONFIRMED,        │
              │  CONFIRMED   │  │   HOLD RELEASED     │
              │  (1777/1778) │  │   (2583/2584)       │
              └──────┬───────┘  └─────────────────────┘
                     │
               libera holds
                     │
                     ▼
       ┌───────────────────────────┐
       │ CANCELLED, CONFIRMED,     │
       │ HOLD RELEASED             │
       │ (1777+2583)               │
       └───────────────────────────┘


  Flujo paralelo — Lista de espera:

  No hay DISPONIBLE + hay ON HOLD:
       agencia solicita
              │
              ▼
       ┌────────────┐
       │  PENDING   │   estadoPedido = 2
       │ (WL activo)│   con fecha de vencimiento
       └─────┬──────┘
             │
    operador asigna manualmente
    cuando se libera un ON HOLD
             │
             ▼
       ┌──────────┐
       │ ON HOLD  │  → flujo normal arriba
       └──────────┘
```

---

## 14. Reglas de negocio (verificadas en código fuente)

| #   | Regla                                                                                                          |
|-----|----------------------------------------------------------------------------------------------------------------|
| R1  | La disponibilidad se valida por **espacios (pax)**: si adultos+niños existentes >= capacidad de cabina → error |
| R2  | El total de pasajeros del itinerario no puede superar `itinerario.disponibles` del barco                      |
| R3  | Cada agencia tiene una **cuota de bloqueos** mensual/anual. Al crear ON HOLD se consume una cuota              |
| R4  | El plazo de vencimiento se calcula según parámetro `TIPO_MAX_BLOQUEO` de la empresa                           |
| R5  | Si el vencimiento cae sábado → +2880 minutos; si cae domingo → +1440 minutos                                  |
| R6  | Cuando se bloquea una cabina, se crean bloqueos **secundarios** en cabinas del mismo barco con fechas solapadas|
| R7  | Lista de espera solo aplica si no hay disponibles pero sí hay ON HOLD. Sin ON HOLD → solicitud rechazada       |
| R8  | El operador asigna manualmente desde la lista de espera. El sistema no asigna automáticamente                  |
| R9  | Al confirmar, el sistema crea automáticamente un pasajero vacío por cada adulto y niño                         |
| R10 | Pasajero sin boleto aéreo = cargo de **$50** por pasajero (*"Penalty fee for the Galapagos air tickets"*)      |
| R11 | La extensión de plazo suma días×1440 + horas×60 minutos a la fecha actual de vencimiento                      |
| R12 | Se registra número de extensiones (`nroExtensiones`) y fecha de la primera extensión                          |
| R13 | El timer de expiración corre **cada 3 minutos** y usa stored procedures en base de datos                       |
| R14 | Un pedido puede incluir múltiples cabinas del mismo itinerario (forman un grupo)                               |
| R15 | El código del grupo es el código del **primer pedido** creado; los siguientes lo heredan                       |
| R16 | Al liberar, se registra en el pedido: `"[usuario] HD RELEASED"` con fecha                                     |
| R17 | Si se modifica nacionalidad o edad de un pasajero, sus servicios adicionales se eliminan automáticamente       |
| R18 | Si se modifica nombre, pasaporte o edad, se recalculan los boletos aéreos automáticamente                      |

---

## 15. Notificaciones del sistema

| Evento                          | Destinatarios           | Qué se envía                                       |
|---------------------------------|-------------------------|----------------------------------------------------|
| ON HOLD creado                  | Agencia + Operador      | Confirmación con fecha vencimiento                 |
| WL creada                       | Agencia + Operador      | Confirmación ingreso a lista de espera             |
| WL eliminada manualmente        | Agencia                 | Notificación de baja de lista de espera            |
| Vencimiento próximo (1ra vez)   | Agencia                 | Recordatorio: pedido próximo a vencer              |
| Vencimiento próximo (2da vez)   | Agencia                 | Último aviso de vencimiento                        |
| Confirmación de venta           | Agencia + Operador      | Detalle de la confirmación con cabinas             |
| Liberación / Cancelación manual | Agencia                 | Notificación de cancelación                        |
| Cancelación automática (timer)  | Agencia                 | Notificación separada de expiración automática     |
| Extensión aprobada              | Agencia                 | Confirmación de nueva fecha de vencimiento         |

---

## 16. Funciones adicionales del operador

| Función                        | Descripción                                                                    |
|--------------------------------|--------------------------------------------------------------------------------|
| **Abrir/Cerrar cabina**        | Bloquea espacios por mantenimiento. Al abrir, libera los espacios              |
| **Abrir/Cerrar itinerario**    | Hace visible o invisible el itinerario para agencias                           |
| **Intercambiar cabinas**       | Mueve pasajeros de una cabina a otra dentro del mismo itinerario               |
| **Reasignar espacios**         | Redistribuye espacios entre pedidos del mismo grupo                            |
| **Ver disponibilidad**         | Estado en tiempo real de todas las cabinas del itinerario                      |
| **Ver lista de espera**        | Agencias en espera por itinerario con detalle de solicitud                     |
| **Gestionar tarifas/promos**   | Actualizar tarifas y promociones por cabina e itinerario                       |
| **Ver disponibilidad API**     | Consultar disponibilidad de proveedores externos (Goware, Andando Tours, etc.) |
| **Actividad / Historial**      | Búsqueda filtrada por estado: bloqueados, en proceso, lista de espera, confirmados, expirados, agrupados |
| **Dashboard operativo**        | Panel de alertas: bloqueos próximos a vencer, confirmaciones incompletas, facturas pendientes |
| **Exportar reportes**          | XLS de reservas, manifiestos de pasajeros por itinerario                       |

---

## 17. Lo que el sistema calcula automáticamente

- Contadores del itinerario en tiempo real: `bloqueados`, `confirmados`, `listaEspera`, `disponibles`
- Estado actualizado de cada cabina (color visual por estado)
- Tarifas finales al confirmar (stored procedure `calcular_tarifa_grupo_promocion_galavail2`)
- Totales del pedido/grupo tras cada cambio de pasajero o servicio
- Cargos adicionales: sin boleto aéreo ($50/pax), servicios adicionales, extras de cancelación

---

## 18. Control de acceso por rol

El sistema controla qué acciones puede realizar cada tipo de usuario mediante permisos configurables:

| Permiso                          | Descripción                                         |
|----------------------------------|-----------------------------------------------------|
| `place_on_hold`                  | Crear bloqueos ON HOLD                              |
| `waiting_list`                   | Ver y gestionar lista de espera                     |
| `close_open_itinerario`          | Abrir o cerrar un itinerario                        |
| `close_open_cabina`              | Abrir o cerrar una cabina (mantenimiento)           |
| `reasignacion_act`               | Reasignar espacios entre pedidos                    |
| `voucher_cabina`                 | Generar y ver voucher de cabina                     |
| `mostrar_disponibilidad_api_rest`| Consultar disponibilidad de proveedores externos    |

> Los roles se configuran en la plataforma y pueden asignarse individualmente a cada usuario.

---

## 19. Documentos generados

El sistema genera documentos de soporte para cada reserva confirmada:

| Documento      | Cuándo se genera                    | Para quién   |
|----------------|-------------------------------------|--------------|
| **Voucher**    | Al confirmar el bloqueo/reserva     | Agencia      |
| **Proforma**   | Al confirmar, antes de pago final   | Agencia      |
| **Factura**    | Al completar el proceso de pago     | Agencia      |
| **Manifiesto** | Exportación por itinerario          | Operaciones  |
| **Reporte XLS**| Bajo demanda desde pantalla Actividad| Supervisión |

---

## 20. Diferencias FIT vs Charter

| Aspecto                     | Modo FIT                              | Modo Charter                              |
|-----------------------------|---------------------------------------|-------------------------------------------|
| **Tipo de reserva**         | Individual por pasajero               | Grupo grande o barco completo             |
| **Validación de edad**      | Reglas estándar adulto/niño           | Reglas más estrictas por contrato         |
| **Selección de ocupación**  | Libre                                 | Requiere ocupación específica del contrato|
| **Código de grupo**         | Primer pedido define el grupo         | Mismo comportamiento                      |
| **Capacidad**               | Validación normal PAX vs cabina       | Validación más estricta                   |

---

## 21. Sesión y seguridad

- **Tiempo de sesión:** 120 minutos de inactividad → cierre automático
- **Idioma:** interfaz disponible en español e inglés
- **Accesos diferenciados:** panel de administración (`/web/management/`) separado del panel de agencia (`/web/agent/`)

