# Gestión de Bloqueos de Cabinas — Documento Funcional

**Proyecto:** Galápagos Travel Center (GTC)  
**Proceso:** Gestión de disponibilidad y bloqueos de cabinas de cruceros  
**Versión:** 2.0 (revisada con análisis del sistema existente)  
**Audiencia:** Dueño del proceso / Operaciones

---

## ¿De qué trata este proceso?

El sistema permite que las agencias de viaje reserven (bloqueen) temporalmente cabinas en cruceros de Galápagos. El operador (Royal/GTC) administra esas solicitudes, confirma ventas, libera espacios y gestiona listas de espera cuando un barco está lleno.

---

## Actores del proceso

| Actor | Rol |
|---|---|
| **Agencia** | Solicita bloqueos y reservas para sus clientes |
| **Operador GTC** | Administra disponibilidad, aprueba confirmaciones, gestiona lista de espera |
| **Sistema** | Expira bloqueos automáticamente, notifica, recalcula disponibilidad |

---

## Conceptos clave

| Término | Qué es |
|---|---|
| **Barco** | El crucero con sus características (capacidad, cabinas, itinerarios) |
| **Cabina** | Cada espacio físico del barco (tipo: simple, doble, suite, triple) |
| **Itinerario / Salida** | Un viaje específico del barco con fechas de salida y retorno |
| **Espacio** | Cada lugar dentro de una cabina (ej: una cabina doble tiene 2 espacios) |
| **Pedido** | La solicitud de bloqueo o reserva que hace una agencia |
| **Grupo** | Conjunto de pedidos de la misma agencia para el mismo itinerario |
| **Modo FIT** | Reserva individual (por pasajero) |
| **Modo Charter** | Reserva de todo el barco o grupo grande |

---

## Estados de un pedido

Cada pedido pasa por diferentes estados a lo largo de su vida:

| Estado | Qué significa para el negocio |
|---|---|
| **On Hold** | La cabina está bloqueada para una agencia. Nadie más puede tomarla. Tiene fecha de vencimiento. |
| **Pending (Lista de Espera)** | La agencia solicitó pero no hay cabinas libres. Queda en fila esperando que se libere algo. |
| **Confirmed** | La venta está confirmada. Los pasajeros quedan registrados. |
| **Hold Released** | El bloqueo fue liberado (venció o se canceló antes de confirmar). La cabina queda disponible. |
| **Cancelled, Confirmed** | La venta estaba confirmada pero algunas cabinas fueron canceladas. |
| **Confirmed, Hold Released** | Venta confirmada, pero algunos holds adicionales fueron liberados. |
| **Cancelled, Confirmed, Hold Released** | Venta con cabinas canceladas y sus holds liberados. |

---

## Flujo 1 — Bloqueo directo (hay cabinas disponibles)

**Cuándo aplica:** Hay espacios libres en el itinerario.

```
1. La agencia ve la disponibilidad del itinerario
2. Selecciona las cabinas y número de pasajeros (adultos + niños)
3. El operador ejecuta el bloqueo
4. El sistema verifica:
   - ¿Hay espacio suficiente en las cabinas seleccionadas?
   - ¿El total de pasajeros no supera la capacidad del barco?
5. Si todo está bien → el pedido queda en ON HOLD
6. El sistema asigna fecha de vencimiento automáticamente
   (basada en la configuración de la empresa y la fecha de salida)
7. Si la fecha de vencimiento cae sábado → se extiende 2 días más
   Si cae domingo → se extiende 1 día más
```

**Resultado:** Pedido en **ON HOLD**, cabina bloqueada, fecha de vencimiento asignada.

---

## Flujo 2 — Lista de espera (no hay cabinas disponibles)

**Cuándo aplica:** El itinerario no tiene cabinas libres, pero hay pedidos en ON HOLD que podrían liberarse.

```
1. La agencia solicita un bloqueo
2. El sistema detecta que no hay cabinas disponibles
3. La solicitud queda en PENDING (lista de espera)
4. El sistema registra la solicitud con fecha de vencimiento
5. El operador recibe notificación
6. Cuando algún ON HOLD se libera, el operador ve la lista de espera
7. El operador decide manualmente a qué agencia asignar el espacio
8. La agencia en espera pasa de PENDING → ON HOLD
   (y el pedido de lista de espera queda marcado como "SE CONVIERTE A PEDIDO")
```

**Resultado:** La agencia gana el bloqueo que se liberó, su pedido anterior de espera queda cerrado.

---

## Flujo 3 — Confirmación de venta

**Cuándo aplica:** La agencia decide confirmar la compra mientras el pedido está en ON HOLD.

```
1. El operador selecciona los pedidos del grupo a confirmar
2. Indica si los pasajeros desean boletos aéreos o no
3. El sistema:
   - Cambia el estado a CONFIRMED
   - Crea automáticamente un registro por cada pasajero (adulto y niño)
   - Calcula tarifas finales según promociones vigentes
   - Registra fecha de confirmación
4. Se envía mail de confirmación a la agencia
```

**Importante:** Al confirmar, si el pasajero NO desea boleto aéreo, se aplica un cargo adicional de $50 por pasajero.

---

## Flujo 4 — Liberación de bloqueo (Hold Release)

**Cuándo aplica:** La agencia o el operador decide liberar el espacio sin confirmar.

```
1. El operador selecciona los pedidos a liberar
2. El sistema:
   - Cambia el estado a HOLD RELEASED
   - Libera los espacios de las cabinas
   - Las cabinas vuelven a estar DISPONIBLES
   - Registra quién realizó la liberación y cuándo
3. Se envía notificación de cancelación
```

---

## Flujo 5 — Cancelación de una confirmación

**Cuándo aplica:** Una venta ya confirmada necesita ser cancelada.

```
1. El operador cancela la confirmación
2. El sistema:
   - Cambia el estado a CANCELLED, CONFIRMED
   - Inactiva los pasajeros registrados
   - Inactiva los servicios adicionales (excepto cargos de cancelación)
   - Registra fecha y usuario que canceló
```

---

## Flujo 6 — Vencimiento automático (sistema)

**Cuándo aplica:** El plazo de un ON HOLD llega a su fecha de vencimiento sin ser confirmado.

```
Cada 3 minutos el sistema revisa pedidos vencidos:

Para bloqueos normales vencidos:
  → El estado cambia a HOLD RELEASED
  → Los espacios se liberan automáticamente
  → Las cabinas vuelven a estar DISPONIBLES

Para bloqueos vencidos que tienen lista de espera:
  → Igual que arriba, pero el sistema también
    notifica al operador que hay pedidos en espera esperando ese espacio

Para pedidos en lista de espera vencidos:
  → Se eliminan de la fila
```

---

## Flujo 7 — Extensión de plazo

**Cuándo aplica:** La agencia necesita más tiempo antes de confirmar.

```
Opción A — Solicitud de extensión:
  1. La agencia solicita más tiempo
  2. El operador aprueba y define días/horas adicionales
  3. El sistema suma el tiempo aprobado a la fecha de vencimiento
  4. Se registra número de extensiones realizadas

Opción B — Extensión directa por operador:
  1. El operador extiende directamente el plazo
  2. Solo se puede extender si aún NO ha vencido
  3. El sistema actualiza la fecha de vencimiento
  4. Se envía mail de confirmación de extensión
```

---

## Reglas de negocio

| # | Regla |
|---|---|
| **R1** | Una cabina bloqueada o confirmada **no puede** ser tomada por otra agencia |
| **R2** | La disponibilidad se valida por **espacios (pax)**, no solo por cabina. Si una cabina tiene capacidad para 2 y ya hay 1 pax bloqueado, solo puede entrar 1 más |
| **R3** | El total de pasajeros de un itinerario **no puede superar** la capacidad del barco |
| **R4** | El plazo de vencimiento se calcula según configuración de la empresa y la fecha de salida del crucero |
| **R5** | Si el vencimiento cae en fin de semana, se extiende automáticamente (sábado +2 días, domingo +1 día) |
| **R6** | La lista de espera solo aplica cuando NO hay cabinas disponibles pero SÍ hay bloqueos activos |
| **R7** | El operador decide manualmente a qué agencia de la lista de espera asignar un espacio liberado |
| **R8** | Al confirmar, el sistema crea automáticamente un registro por cada pasajero |
| **R9** | Si un pasajero no desea boleto aéreo, se aplica un cargo de $50 por pasajero |
| **R10** | La extensión de plazo solo se puede hacer si el pedido todavía no ha vencido |
| **R11** | Se lleva registro completo de quién hizo cada cambio, cuándo y por qué |
| **R12** | El sistema revisa pedidos vencidos cada 3 minutos automáticamente |
| **R13** | Un pedido puede incluir múltiples cabinas del mismo itinerario en una sola operación |
| **R14** | Los pedidos se agrupan por agencia e itinerario (concepto de "grupo") |

---

## Notificaciones del sistema

| Evento | A quién | Qué se envía |
|---|---|---|
| Bloqueo creado (ON HOLD) | Agencia + Operador | Confirmación del bloqueo con fecha de vencimiento |
| Lista de espera creada | Agencia + Operador | Confirmación de ingreso a lista de espera |
| Lista de espera eliminada | Agencia | Notificación de baja de lista de espera |
| Vencimiento próximo | Agencia | Recordatorio de vencimiento (notificación 1 y 2) |
| Confirmación de venta | Agencia + Operador | Detalle de la confirmación |
| Liberación / Cancelación | Agencia | Notificación de cancelación |
| Extensión de plazo aprobada | Agencia | Confirmación de nueva fecha de vencimiento |

---

## Funciones adicionales del operador

| Función | Descripción |
|---|---|
| **Abrir/Cerrar cabina** | El operador puede marcar una cabina como no disponible temporalmente (mantenimiento u otro motivo) |
| **Intercambiar cabinas** | Mover pasajeros de una cabina a otra dentro del mismo itinerario |
| **Reasignar espacios** | Redistribuir espacios de cabina entre pedidos |
| **Ver disponibilidad en tiempo real** | Ver el estado de todas las cabinas de un itinerario (disponible, bloqueada, confirmada) |
| **Ver lista de espera** | Ver todas las agencias en espera para un itinerario |
| **Reportes** | Reporte de grupos, actividad, extensiones, cancelaciones |

---

## Lo que el sistema calcula automáticamente

- Estado actualizado de cada cabina en tiempo real
- Disponibilidad del barco (cuántos pasajeros quedan disponibles)
- Contadores del itinerario: bloqueados, confirmados, en espera, disponibles
- Tarifas finales al confirmar (según promociones vigentes)
- Cargos adicionales (sin boleto aéreo, servicios adicionales)

