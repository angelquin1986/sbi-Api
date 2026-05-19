# Gestión de Bloqueos de Cabinas — Documento Funcional

**Aplicable a:** Operadores de cruceros (genérico)
**Proceso:** Gestión de bloqueos y disponibilidad de cabinas
**Alcance:** Exclusivamente bloqueos, lista de espera, liberación, mantenimiento y expiración. No incluye confirmación de venta ni cancelación de venta.
**Versión:** 5.0 — Revisión funcional: alcance reducido a bloqueos
**Audiencia:** Dueño del proceso / Operaciones

---

## 1. ¿De qué trata este proceso?

El sistema permite que las agencias de viaje bloqueen temporalmente cabinas en cruceros. El operador administra esas solicitudes: libera espacios, gestiona listas de espera, controla el mantenimiento de cabinas y monitorea el vencimiento automático de bloqueos.

> **Nota:** Este documento cubre únicamente el ciclo de vida de bloqueos. Los flujos de confirmación de venta y cancelación de confirmación pertenecen a un documento separado.

---

## 2. Actores del proceso

| Actor        | Qué hace                                                              |
|--------------|-----------------------------------------------------------------------|
| **Agencia**  | Solicita bloqueos, entra en lista de espera, solicita extensiones, libera bloqueos |
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
| **Modo Charter**      | Bloqueo del barco completo; requiere cubrir la capacidad total del barco             |
| **WL**                | Waiting List — lista de espera cuando no hay disponibilidad directa                 |

---

## 4. Estados de un pedido

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ESTADOS EN BASE DE DATOS                        │
│                                                                     │
│  Tipo 2    → LISTA DE ESPERA (Pending)  [tipo pedido WL, sin cabina] │
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
│          LO QUE VE EL USUARIO (estados relevantes a bloqueos)       │
│                                                                     │
│  On Hold       → Cabina bloqueada para la agencia                   │
│  Pending       → En lista de espera                                 │
│  Time Limit    → Bloqueo próximo a vencer                           │
│  Hold Released → Bloqueo liberado (manual o automático)             │
└─────────────────────────────────────────────────────────────────────┘

  Nota: "Expired/Caducado" y "Hold Released" son el mismo resultado final
  visto desde dos caminos distintos:
  - Hold Released manual  = agencia o operador libera explícitamente
  - Hold Released auto    = el timer lo libera al vencer el plazo
  En ambos casos la cabina queda DISPONIBLE nuevamente.
```

> **¿Qué es el estado secundario?**
> Cuando se bloquea una cabina (estado **principal** 167), el sistema identifica
> automáticamente otras cabinas del mismo barco cuyos itinerarios se solapan en
> fechas con el bloqueo actual, y las marca con estado **secundario** (177).
> Esto evita que esas cabinas puedan venderse para fechas que ya están comprometidas.
>
> Ejemplo: si bloqueas la cabina 5 del barco "Evolution" para el viaje 10–17 jun,
> el sistema también bloquea automáticamente la cabina 5 del viaje 14–21 jun
> (porque se solapan 3 días). Ese segundo bloqueo es el "secundario".
> Cuando el bloqueo principal se libera, los secundarios también se liberan.

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
- La referencia del pedido **no puede contener "/"** y tiene máximo **25 caracteres**
- **Regla soloGrupo:** si el itinerario es de tipo grupo y es el primer bloqueo, los espacios seleccionados deben ser `>= mínimo del grupo` (`minSoloGrupo`)
- **Regla soloCharter:** si el itinerario es charter, los espacios seleccionados deben cubrir toda la capacidad del barco
- **Cabina compartida:** si ya existe un bloqueo con `compartida = false`, no se puede agregar otro pasajero → modal de error
- **Triple cabina:** si una cabina compartida tiene capacidad > 2 y queda 1 espacio libre tras el bloqueo, el sistema cierra automáticamente ese espacio restante por mantenimiento

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
- La referencia del WL **no puede contener "/"** (validación en servidor, máx 25 caracteres)
- Al crear WL se requiere **mínimo 1 adulto**; niños puede ser 0

---

## 7. Flujo 3 — Liberación de bloqueo (Hold Release)

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

## 8. Cierre y apertura de cabina (Mantenimiento operativo)

**Cuándo aplica:** El operador necesita cerrar o abrir una cabina por motivos operativos (reparación, fuera de servicio, etc.). Funcionalmente se trata como un cierre/apertura; internamente el sistema lo persiste mediante un pedido de tipo mantenimiento.

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

## 9. Flujo 4 — Expiración automática

> **En simple:** El sistema tiene un proceso automático que revisa periódicamente si algún bloqueo venció. Si venció, lo libera solo, sin que nadie tenga que hacer nada. Existen dos variantes de este proceso: uno para bloqueos sin lista de espera, y otro para bloqueos que tienen agencias esperando en lista de espera (para notificar correctamente en cada caso).

```
  CASO A — Bloqueo vence sin nadie en lista de espera
  ─────────────────────────────────────────────────────
  Timer detecta pedido ON HOLD con fechaCaduca vencida
       │
       ▼
  Libera bloqueo → cabina vuelve a DISPONIBLE
  Recalcula contadores del itinerario
  Envía mail de cancelación automática a la agencia

  CASO B — Bloqueo vence y había una WL esperando
  ─────────────────────────────────────────────────
  Timer detecta pedido ON HOLD con fechaCaduca vencida
  + existe lista de espera activa en ese itinerario
       │
       ▼
  Libera bloqueo → cabina vuelve a DISPONIBLE
  Notifica al operador que hay WL disponible para asignar
  Recalcula contadores del itinerario

  CASO C — WL propia vence
  ─────────────────────────
  Timer detecta pedido WL con fechaCaduca vencida
       │
       ▼
  Elimina la WL
  Recalcula contadores del itinerario
```

> **Nota técnica:** Existen 2 timers separados en el sistema (`PedidoCaducadoTimer` y `PedidoCaducadoWLTimer`). La frecuencia de ejecución es **configurable** en el parámetro `INTERVAL_IN_MINUTES` del sistema.

---

## 10. Flujo 5 — Extensión de plazo

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
     │                    ┌─────────┴──────────┐               │
     │                    │  Aprueba o rechaza  │               │
     │                    └─────────┬──────────┘               │
     │                              │                           │
     │                    ┌─────────▼──────────┐               │
     │                    │    ¿APRUEBA?        │               │
     │                    └─────────┬──────────┘               │
     │            SÍ ───────────────┤──── NO ──────────────────│
     │             │                                            │
     │             │                                    estadoSolicitud = RECHAZADO
     │             │                                    Notificación de rechazo
     │             │                                            │
     │             ├─► fechaCaduca += (dias×1440 + horas×60) min
     │             │   nroExtensiones++                        │
     │             │   Registra fechaExtensionInicial           │
     │◄── Mail extensión aprobada ──────────────────────────────│
```

**Restricciones del formulario de extensión:**
- Días: mínimo 0, **máximo 8**
- Horas: mínimo 0, **máximo 8**
- Ambos campos son requeridos

**Reglas verificadas:**
- Solo se puede extender si el pedido todavía **no ha vencido**
- Al aprobar: `estadoSolicitud = APROBADO`, `notificado = INACTIVO`, se envía mail
- Al rechazar: `estadoSolicitud = RECHAZADO`, `notificado = INACTIVO`, se envía notificación de rechazo
- El contador `nroExtensiones` se incrementa solo en aprobación
- La fecha de la primera extensión (`fechaExtensionInicial`) se registra solo la primera vez

---

## 11. Máquina de estados completa

```
                              ┌─────────┐
                              │DISPONIBLE│
                              └────┬────┘
               ┌────────────────── │ ──────────────────────────┐
               │ agencia solicita  │                   operador cierra
               │ + hay espacios    │                   cabina (mant.)
               ▼                   ▼                           ▼
         ┌──────────┐       ┌────────────┐            ┌──────────────┐
  ┌──────│ ON HOLD  │       │  PENDING   │            │ MAINTENANCE  │
  │      │ (167/177)│       │  WL (2)    │            │ (168/303)    │
  │      └────┬─────┘       └─────┬──────┘            └──────┬───────┘
  │           │                   │                          │
  │      expira                operador                  operador
  │      o libera              asigna                    abre cabina
  │           │                   │                          │
  │           ▼                   ▼                          ▼
  │    ┌─────────────┐      ┌──────────┐               DISPONIBLE
  │    │HOLD RELEASED│      │ ON HOLD  │
  │    │(2583/2584)  │      │(167/177) │
  │    └──────┬──────┘      └──────────┘
  │           │
  │    cabinas → DISPONIBLE
  │
  └── (vencimiento automático también lleva a HOLD RELEASED)
```

> **¿Cómo funciona el Mantenimiento?**
> El operador puede cerrar una cabina **directamente desde el estado DISPONIBLE**,
> sin necesidad de que exista un bloqueo previo. Es una acción operativa
> (reparación, barco en dique, ajuste de capacidad) que impide que la cabina
> aparezca disponible para las agencias. Al abrir la cabina, vuelve a DISPONIBLE.

---

## 12. Reglas de negocio (verificadas en código fuente)

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
| R11 | La extensión de plazo suma días×1440 + horas×60 minutos a la fecha actual de vencimiento                      |
| R12 | Se registra número de extensiones (`nroExtensiones`) y fecha de la primera extensión                          |
| R13 | Existen **2 timers separados**: uno para holds vencidos normales y otro para holds vencidos con lista de espera activa. La frecuencia de ejecución es **configurable** (`INTERVAL_IN_MINUTES`) |
| R14 | Un pedido puede incluir múltiples cabinas del mismo itinerario (forman un grupo)                               |
| R15 | El código del grupo es el código del **primer pedido** creado; los siguientes lo heredan                       |
| R16 | Al liberar, se registra en el pedido: `"[usuario] HD RELEASED"` con fecha                                     |
| R19 | La referencia del pedido (hold y WL) **no puede contener "/"** y tiene máximo **25 caracteres**                |
| R20 | **Itinerario soloGrupo:** el primer bloqueo debe cubrir al menos el mínimo de espacios del grupo               |
| R21 | **Itinerario soloCharter:** el bloqueo debe cubrir la capacidad completa del barco                             |
| R22 | **Cabina triple compartida:** si tras bloquear queda exactamente 1 espacio libre en una cabina capacidad>2, el sistema lo cierra automáticamente por mantenimiento |
| R23 | La extensión tiene límite: **máximo 8 días y 8 horas**. El operador puede también **rechazar** la solicitud    |
| R24 | La **agencia** no tiene acceso a mantenimiento de cabina, apertura/cierre de itinerario ni reasignación — esas funciones son exclusivas del operador |

---

## 13. Notificaciones del sistema

| Evento                          | Destinatarios           | Qué se envía                                       |
|---------------------------------|-------------------------|----------------------------------------------------|
| ON HOLD creado                  | Agencia + Operador      | Confirmación con fecha vencimiento                 |
| WL creada                       | Agencia + Operador      | Confirmación ingreso a lista de espera             |
| WL eliminada manualmente        | Agencia                 | Notificación de baja de lista de espera            |
| Vencimiento próximo (1ra vez)   | Agencia                 | Recordatorio: pedido próximo a vencer              |
| Vencimiento próximo (2da vez)   | Agencia                 | Último aviso de vencimiento                        |
| Liberación / Cancelación manual | Agencia                 | Notificación de cancelación                        |
| Cancelación automática (timer)  | Agencia                 | Notificación separada de expiración automática     |
| Extensión aprobada              | Agencia                 | Confirmación de nueva fecha de vencimiento         |

---

## 14. Funciones del operador

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

## 15. Lo que el sistema calcula automáticamente

- Contadores del itinerario en tiempo real: `bloqueados`, `confirmados`, `listaEspera`, `disponibles`
- Estado actualizado de cada cabina (color visual por estado)
- Tarifas finales al confirmar (stored procedure `calcular_tarifa_grupo_promocion_galavail2`)
- Totales del pedido/grupo tras cada cambio de pasajero o servicio
- Cargos adicionales: sin boleto aéreo ($50/pax), servicios adicionales, extras de cancelación

---

## 16. Control de acceso por rol

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

## 17. Documentos generados

El sistema genera documentos de soporte para cada reserva confirmada:

| Documento      | Cuándo se genera                    | Para quién   |
|----------------|-------------------------------------|--------------|
| **Manifiesto** | Exportación por itinerario          | Operaciones  |
| **Reporte XLS**| Bajo demanda desde pantalla Actividad| Supervisión |

---

## 18. Diferencias FIT vs Charter

| Aspecto                     | Modo FIT                              | Modo Charter                              |
|-----------------------------|---------------------------------------|-------------------------------------------|
| **Tipo de reserva**         | Individual por pasajero               | Grupo grande o barco completo             |
| **Validación de edad**      | Reglas estándar adulto/niño           | Reglas más estrictas por contrato         |
| **Selección de ocupación**  | Libre                                 | Requiere ocupación específica del contrato|
| **Código de grupo**         | Primer pedido define el grupo         | Mismo comportamiento                      |
| **Capacidad**               | Validación normal PAX vs cabina       | Validación más estricta                   |

---

## 19. Sesión y seguridad

- **Tiempo de sesión:** 120 minutos de inactividad → cierre automático
- **Idioma:** interfaz disponible en español e inglés
- **Accesos diferenciados:** panel de administración (`/web/management/`) separado del panel de agencia (`/web/agent/`)


---

## 20. Ejemplos prácticos por caso de uso

> Casos reales, cortos y didácticos para entender el comportamiento del sistema.

---

### 🟢 Caso 1 — Bloqueo directo exitoso

**Situación:** La agencia "Galápagos Tours" quiere bloquear la cabina doble del barco "Evolution" para la salida del 10 de junio.

```
Barco:      Evolution
Itinerario: 10 jun – 17 jun
Cabina:     Doble (capacidad 2)
Ocupada:    0 pax actualmente
Solicitud:  2 adultos

✅ Validación pasa:
   - 2 adultos + 0 existentes = 2 < capacidad 2 → OK
   - Total barco: 12 pax disponibles, se usan 2 → OK
   - Cuota mensual agencia: 5 bloqueos restantes → OK

Resultado:
   - Pedido creado: estado ON HOLD (167)
   - Vence: miércoles 12 jun 18:00 (según parámetro empresa)
   - Bloqueos secundarios (177) creados en cabinas de
     itinerarios del mismo barco que se solapan en fechas
   - Mail enviado a agencia y operador
```

---

### 🔴 Caso 2 — Bloqueo rechazado por cabina llena

**Situación:** Otra agencia intenta bloquear la misma cabina doble del Caso 1.

```
Cabina:     Doble (capacidad 2)
Ocupada:    2 pax (bloqueo de Galápagos Tours)
Solicitud:  1 adulto

❌ Validación falla:
   - 1 nuevo + 2 existentes = 3 >= capacidad 2

Resultado:
   - Error: "This cabin has no spaces available"
   - No se crea pedido
```

---

### 🟡 Caso 3 — Lista de espera (sin disponibilidad)

**Situación:** Todas las cabinas del itinerario están bloqueadas (ON HOLD), pero la agencia "Natura" quiere entrar.

```
Barco:      Evolution
Itinerario: 10 jun – 17 jun
Disponibles: 0  (todas ocupadas con ON HOLD)
ON HOLD activos: SÍ

La agencia solicita bloqueo → sistema detecta 0 disponibles
→ Ofrece entrar a lista de espera

Solicitud WL: 2 adultos, referencia "NAT-001"

Resultado:
   - Pedido creado: tipo WL (estadoPedido=2), estado PENDING
   - Contador WL del itinerario: +1
   - Mail enviado a agencia (WL confirmada) y operador (alerta)
   - Agencia espera a que algún ON HOLD se libere o venza
```

---

### ⚫ Caso 4 — Lista de espera rechazada (sin holds activos)

**Situación:** El itinerario está disponible (no hay holds), la agencia solicita WL por error.

```
Disponibles: 0
ON HOLD activos: 0 (itinerario lleno de confirmados)

❌ No aplica WL:
   - Sin ON HOLD no hay expectativa de liberación

Resultado:
   - El sistema no permite crear WL
   - La agencia debe esperar a que se abra disponibilidad
```

---

### 🔵 Caso 5 — Conversión de WL a ON HOLD

**Situación:** El bloqueo de "Galápagos Tours" (Caso 1) vence. La agencia "Natura" estaba en WL.

```
Evento:     Timer libera pedido de Galápagos Tours
            → cabina queda disponible
            → operador ve lista de espera

Operador asigna cabina a "Natura":
   - WL antiguo: estado → INACTIVO
     dadoBajaUsuario = "SE CONVIERTE A PEDIDO"
   - Nuevo pedido ON HOLD creado para "Natura"
   - Hereda fecha vencimiento del WL original
   - Contador WL: -1

Resultado:
   - Agencia "Natura": ahora en ON HOLD ✅
   - Mail de confirmación ON HOLD enviado
```

---

### 🔓 Caso 6 — Liberación de bloqueo (Hold Release)

**Situación:** "Galápagos Tours" decide no confirmar y libera el bloqueo antes de que venza.

```
Pedido:     ON HOLD (167)
Acción:     Agencia o Operador solicita liberar

Sistema:
   - BloqueoEspacios: 167 → 2583 (HOLD RELEASED)
   - Secundarios: 177 → 2584
   - Registra: dadoBajaUsuario = "galturops HD RELEASED"
   - Modo del grupo → FIT (160)

Resultado:
   - Cabina vuelve a estar DISPONIBLE ✅
   - Mail de cancelación enviado
```

---

### 🔧 Caso 7 — Cierre de cabina por mantenimiento

**Situación:** El operador necesita cerrar la cabina Suite del barco por reparación.

```
Cabina:     Suite (capacidad 2)
Acción:     Operador selecciona cabina → "Cerrar cabina"

Sistema crea pedido especial:
   - referencia = "MANTENIMIENTO"
   - adultos = 0, ninos = 0
   - estado ON HOLD tipo MANTENIMIENTO (168)
   - Secundarios (303) en itinerarios solapados

Resultado:
   - Cabina NO aparece como disponible para agencias ✅

Cuando se repara:
   Operador → "Abrir cabina"
   Sistema inactiva BloqueoEspacios de mantenimiento
   → Cabina vuelve a estar DISPONIBLE
```

---

### ⏳ Caso 8 — Vencimiento automático

**Situación:** "Galápagos Tours" no libera ni confirma. El plazo vence.

```
Fecha vencimiento:  martes 11 jun 18:00
Timer (3 min):      detecta pedido vencido a las 18:03

Timer A ejecuta:
   SP: timer_eliminar_pedido_caducado(pedido, false)
   - Inactiva pedido y bloqueos
   - Recalcula contadores del itinerario

Resultado:
   - Cabina DISPONIBLE nuevamente ✅
   - Si había WL → Timer B notifica al operador
   - Mail de cancelación automática enviado a agencia
```

---

### 📅 Caso 9 — Extensión aprobada

**Situación:** "Galápagos Tours" necesita 2 días más para confirmar.

```
Pedido:     ON HOLD, vence el 11 jun 18:00
Solicitud:  2 días, 0 horas

Operador revisa y aprueba:
   fechaCaduca += (2×1440 + 0×60) = +2880 minutos
   Nueva fecha: 13 jun 18:00
   nroExtensiones = 1
   fechaExtensionInicial = 11 jun 18:00

Resultado:
   - Nuevo vencimiento: 13 jun 18:00 ✅
   - Mail de extensión aprobada enviado
```

---

### 🚫 Caso 10 — Extensión rechazada

**Situación:** El operador no aprueba la extensión porque hay WL esperando.

```
Solicitud:  3 días de extensión
Operador:   Rechaza

Sistema:
   estadoSolicitud = RECHAZADO
   Mail de rechazo enviado a agencia

Resultado:
   - Pedido mantiene fecha original ✅
   - Al vencer, timer lo elimina automáticamente
```

---

### 🔄 Caso 11 — Reasignación de cabina

**Situación:** Una familia de 4 confirmada en dos cabinas dobles quiere moverse a una suite cuádruple.

```
Pedido confirmado: 2 cabinas dobles (4 pax total)
Cabina disponible: Suite (capacidad 4)

Operador ingresa código de factura → busca pedido
Sistema valida:
   - Espacios ocupados (4) <= espacios libres en Suite (4) ✅
   - Observación de reasignación: requerida

Sistema ejecuta:
   - Elimina BloqueoEspacios de las 2 dobles
   - Crea BloqueoEspacios en Suite
   - Recalcula tarifa del grupo
   - Envía mail de reasignación

Resultado:
   - 4 pax ahora en Suite ✅
```

---

### 🚢 Caso 12 — Charter (barco completo)

**Situación:** Una empresa quiere reservar el barco completo (15 pax).

```
Barco:      Santa Cruz II (capacidad 15 pax)
Tipo:       soloCharter

Agencia selecciona todas las cabinas:
   - Sistema valida: espacios seleccionados >= capacidad barco (15)
   - Si selecciona menos de 15 → error, no se puede bloquear parcialmente

Resultado:
   - Bloqueo de todo el barco en ON HOLD ✅
   - Sin bloqueos secundarios (no hay cabinas libres en el barco)
```

