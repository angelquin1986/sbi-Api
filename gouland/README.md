# SBI API — Go (gouland)

Backend REST de **Experience Southamerica** migrado a Go con arquitectura hexagonal.
Expone los mismos endpoints que el proyecto Node.js en `../node/` para que el mismo
frontend pueda conectarse a cualquiera de los dos sin cambios.

---

## Arquitectura

```
gouland/
├── cmd/
│   ├── api/        ← entry point del servidor HTTP
│   └── seed/       ← script de datos dummy
├── config/         ← carga de variables de entorno
├── internal/
│   ├── adapters/
│   │   ├── http/   ← handlers Gin + router
│   │   └── mongo/  ← implementaciones de repos MongoDB
│   ├── auth/       ← JWT + bcrypt
│   ├── domain/     ← structs de dominio (models.go)
│   ├── ports/      ← interfaces de repositorios
│   └── usecase/    ← lógica de negocio
└── migrations/     ← scripts de índices MongoDB
```

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Go          | 1.20          |
| Docker      | 24+           |
| Docker Compose | v2+        |

---

## 1 · Levantar MongoDB con Docker

> ⚠️ **Todos los comandos `docker compose` se ejecutan en tu máquina local (terminal),
> NO dentro de ningún contenedor.** Docker se encarga de crear y gestionar los
> contenedores por ti.

### Opción A — Solo MongoDB (recomendada para desarrollo local)

Usa esta opción cuando quieras correr el **backend Go directamente en tu máquina**
(más rápido para desarrollo: hot-reload, debugger, etc.) y solo necesitas la base
de datos en Docker.

```bash
# 📂 Ejecutar desde la RAÍZ del repositorio (carpeta sbi-Api/)
docker compose -f docker-compose.mongo.yml up -d
```

Esto levanta **2 contenedores** en segundo plano:
- **`sbi-mongo`** — MongoDB 6, accesible en `localhost:27017` desde tu máquina
- **`sbi-mongo-ui`** — Mongo Express (UI web) en `http://localhost:8081`
  - Usuario: `admin` / Contraseña: `admin123`

Verificar que están corriendo:
```bash
docker ps
# Debes ver sbi-mongo con estado "(healthy)"
```

Detener los contenedores (sin borrar datos):
```bash
docker compose -f docker-compose.mongo.yml down
```

Detener y borrar todos los datos del volumen:
```bash
docker compose -f docker-compose.mongo.yml down -v
```

---

### Opción B — Stack completo en Docker (MongoDB + API Go)

Usa esta opción cuando quieras correr **todo en contenedores**: el servidor Go y
MongoDB juntos. No necesitas tener Go instalado localmente.

```bash
# 📂 Ejecutar desde la carpeta gouland/ (donde está el docker-compose.yml)
cd gouland
docker compose up --build
```

La API queda disponible en `http://localhost:4000` desde tu máquina.
Los logs de ambos servicios aparecen en la misma terminal.

En segundo plano:
```bash
cd gouland
docker compose up --build -d
```

> **Nota:** Con esta opción, los comandos `go run` y `go run ./cmd/seed` que se
> mencionan más abajo **no aplican** — el seed se ejecuta diferente (ver sección 4).

---

## 2 · Ejecutar el backend Go localmente

> 📍 **Requisito:** MongoDB debe estar corriendo (Opción A del paso anterior).
> El backend Go se ejecuta **en tu máquina local**, NO dentro de Docker.

```bash
# 📂 Ejecutar desde la carpeta gouland/
cd gouland

# Primera vez: descargar dependencias de Go
go mod download

# Iniciar el servidor (corre en tu máquina, se conecta a MongoDB en Docker)
go run ./cmd/api
# → Servidor escuchando en http://localhost:4000
```

El proceso corre en **primer plano** en tu terminal. Para detenerlo: `Ctrl+C`.

Variables de entorno (opcionales, todos tienen valores por defecto):

| Variable       | Default                              | Descripción                     |
|----------------|--------------------------------------|---------------------------------|
| `MONGODB_URI`  | `mongodb://localhost:27017/bookingDB`| URI de MongoDB (el del Docker)  |
| `PORT`         | `4000`                               | Puerto donde escucha la API     |
| `JWT_SECRET`   | `changeme`                           | Secreto para firmar JWT         |

Ejemplo sobreescribiendo variables:
```bash
# 📂 Desde gouland/
MONGODB_URI=mongodb://localhost:27017/bookingDB PORT=4000 go run ./cmd/api
```

---

## 3 · Restaurar backup de producción (db_test)

La carpeta `db_test/bookings/` contiene el respaldo de la base de datos de producción.

### Automático — primera vez que levanta el Docker

> El script `db_test/init/01-import.sh` se ejecuta **automáticamente** cuando el
> volumen de MongoDB está vacío (primera vez o después de `down -v`).

```bash
# Desde la raíz sbi-Api/ — levanta MongoDB y restaura el backup automáticamente
docker compose -f docker-compose.mongo.yml up -d
# El script 01-import.sh corre dentro del contenedor e importa todos los JSONs
```

### Manual — restaurar sobre un Docker ya corriendo

> 📍 Se ejecuta desde tu máquina local, copia los JSONs al contenedor y los importa.

**Con Opción A** (MongoDB standalone `sbi-mongo`):
```bash
# 📂 Desde la raíz sbi-Api/
docker cp db_test/bookings/. sbi-mongo:/tmp/bookings/
docker exec sbi-mongo mongoimport --db bookingDB --collection sellers    --file /tmp/bookings/bookings.sellers.json    --jsonArray --drop
docker exec sbi-mongo mongoimport --db bookingDB --collection contacts   --file /tmp/bookings/bookings.contacts.json   --jsonArray --drop
docker exec sbi-mongo mongoimport --db bookingDB --collection orders     --file /tmp/bookings/bookings.orders.json     --jsonArray --drop
docker exec sbi-mongo mongoimport --db bookingDB --collection passengers --file /tmp/bookings/bookings.passengers.json --jsonArray --drop
docker exec sbi-mongo mongoimport --db bookingDB --collection files      --file /tmp/bookings/bookings.files.json      --jsonArray --drop
docker exec sbi-mongo mongoimport --db bookingDB --collection country    --file /tmp/bookings/bookings.countries.json  --jsonArray --drop
```

**Con Opción B** (stack completo `gouland-mongo-1`):
```bash
# 📂 Desde la raíz sbi-Api/
docker cp db_test/bookings/. gouland-mongo-1:/tmp/bookings/
docker exec gouland-mongo-1 mongoimport --db bookingDB --collection sellers    --file /tmp/bookings/bookings.sellers.json    --jsonArray --drop
docker exec gouland-mongo-1 mongoimport --db bookingDB --collection contacts   --file /tmp/bookings/bookings.contacts.json   --jsonArray --drop
docker exec gouland-mongo-1 mongoimport --db bookingDB --collection orders     --file /tmp/bookings/bookings.orders.json     --jsonArray --drop
docker exec gouland-mongo-1 mongoimport --db bookingDB --collection passengers --file /tmp/bookings/bookings.passengers.json --jsonArray --drop
docker exec gouland-mongo-1 mongoimport --db bookingDB --collection files      --file /tmp/bookings/bookings.files.json      --jsonArray --drop
docker exec gouland-mongo-1 mongoimport --db bookingDB --collection country    --file /tmp/bookings/bookings.countries.json  --jsonArray --drop
```

Datos del backup:

| Colección    | Registros | Descripción                       |
|--------------|-----------|-----------------------------------|
| `sellers`    | 40        | Vendedores de producción          |
| `contacts`   | 75        | Hoteles y operadores              |
| `orders`     | 4 365     | Órdenes reales de reserva         |
| `passengers` | 9 569     | Pasajeros reales                  |
| `files`      | 7 771     | Archivos de confirmación          |
| `country`    | 249       | Países (backup = `countries`)     |

> ⚠️ `--drop` elimina los datos existentes antes de importar. Omite `--drop` si
> quieres agregar sin borrar.

### Reimportar desde cero (borra volumen y re-inicializa)

```bash
# Opción A (standalone)
docker compose -f docker-compose.mongo.yml down -v
docker compose -f docker-compose.mongo.yml up -d

# Opción B (stack completo)
cd gouland
docker compose down -v
docker compose up --build -d
```

---

## 4 · Datos dummy para desarrollo (seed)

### Con backend local (Opción A)

> 📍 Se ejecuta **en tu máquina local**. Se conecta al MongoDB del contenedor Docker.

```bash
# 📂 Desde la carpeta gouland/
cd gouland
go run ./cmd/seed
```

### Con stack Docker completo (Opción B)

> 📍 El seed se ejecuta **dentro del contenedor** de la API Go.

```bash
# Primero levanta el stack
cd gouland
docker compose up --build -d

# Luego ejecuta el seed dentro del contenedor de la API
docker compose exec api /app/seed
```

### Con URI personalizada (cualquier entorno)

```bash
# 📂 Desde gouland/
MONGODB_URI=mongodb://mi-servidor:27017/bookingDB go run ./cmd/seed
```

Datos insertados:

| Colección    | Registros | Descripción                              |
|-------------|-----------|------------------------------------------|
| `countries`  | 15        | Países (Ecuador, Peru, USA, UK…)         |
| `sellers`    | 3         | 1 OPERADOR + 2 AGENTES                   |
| `contacts`   | 4         | Hoteles / operadores de turismo          |
| `orders`     | 5         | Órdenes de reserva con estado `1`        |
| `passengers` | 10        | 2 pasajeros por orden                    |
| `files`      | 5         | 1 archivo de confirmación por orden      |

**Credenciales de prueba:**

| Email                    | Role          | id    |
|--------------------------|---------------|-------|
| operaciones@sbi.com      | OPERADOR_ROLE | AG001 |
| ana.agente@sbi.com       | AGENTE_ROLE   | AG002 |
| luis.vendedor@sbi.com    | AGENTE_ROLE   | AG003 |

> El campo `password` en los sellers del seed es un hash de ejemplo, no funcional.
> Para el endpoint `/login` no se valida contraseña (comportamiento idéntico al Node.js original).

---

## 5 · Verificar la API

Con el servidor corriendo en `http://localhost:4000`:

```bash
# Health check
curl http://localhost:4000/

# Listar países
curl http://localhost:4000/country

# Listar sellers
curl http://localhost:4000/usuario/

# Login (no valida contraseña — devuelve ok:true siempre)
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.agente@sbi.com","password":"cualquiera"}'

# Listar órdenes
curl http://localhost:4000/order/

# Listar pasajeros de una orden (reemplaza <ID> con un _id real de orders)
curl http://localhost:4000/pax/<ID>
```

---

## 6 · Levantar el frontend Angular con Docker

El frontend (`front-end-sbi`) está configurado para llamar al backend Go en
`http://localhost:4000` en modo desarrollo.

> 📍 Los comandos se ejecutan **en tu máquina local**. Docker construye la imagen
> y levanta el contenedor por ti.

### Opción A — Solo el frontend (backend ya corriendo localmente)

```bash
# 📂 Desde la carpeta front-end-sbi/
cd front-end-sbi

# Construir la imagen (solo la primera vez o cuando cambies código)
docker build -t sbi-frontend .

# Levantar el contenedor
docker run -p 4200:4200 sbi-frontend
```

Frontend disponible en: **http://localhost:4200**

> ⚠️ La primera vez tarda varios minutos porque instala ~800MB de dependencias
> (Node 10 + Angular 6). Las siguientes veces es más rápido.

---

### Opción B — Stack completo: MongoDB + API Go + Frontend (todo en Docker)

Un solo comando levanta los 3 servicios juntos:

```bash
# 📂 Desde la carpeta gouland/
cd gouland

# Paso 1 — Construir e iniciar los 3 servicios
docker compose up --build -d
# (la primera vez tarda varios minutos — instala dependencias del frontend)

# Paso 2 — Verificar que los contenedores están corriendo
docker compose ps
# Debes ver: mongo (healthy), api (running), frontend (running)

# Paso 3 — Poblar la base de datos con datos dummy
docker compose exec api /app/seed

# Paso 4 — Abrir el frontend
open http://localhost:4200
```

Servicios disponibles:

| Servicio   | URL                       | Descripción         |
|------------|---------------------------|---------------------|
| Frontend   | http://localhost:4200     | Angular SPA         |
| API Go     | http://localhost:4000     | Backend REST        |
| MongoDB    | interno (sin puerto host) | Base de datos       |

Ver logs en tiempo real:
```bash
docker compose logs -f frontend   # logs del Angular
docker compose logs -f api        # logs del Go
```

Detener todo:
```bash
docker compose down
```

---

## 7 · Flujo completo de desarrollo LOCAL (sin Docker para el código)

> Todo esto corre **en tu máquina local**. Solo MongoDB vive dentro de Docker.

```bash
# ── Terminal 1 ── (la dejas corriendo)

# 1. Levantar MongoDB en Docker (desde la raíz sbi-Api/)
docker compose -f docker-compose.mongo.yml up -d

# 2. Verificar que el contenedor está saludable (~10 seg)
docker ps
# sbi-mongo debe mostrar "(healthy)"

# 3. Ir a la carpeta del proyecto Go
cd gouland

# 4. Instalar dependencias (solo la primera vez)
go mod download

# 5. Llenar la base de datos con datos dummy (se conecta al Docker de mongo)
go run ./cmd/seed

# 6. Iniciar el backend Go en tu máquina (se conecta al Docker de mongo)
go run ./cmd/api
# → API corriendo en http://localhost:4000
```

```bash
# ── Terminal 2 ── (frontend Angular en local)
cd front-end-sbi
npm install        # solo la primera vez
npm start          # → http://localhost:4200
```

```bash
# ── Terminal 3 ── (para verificar mientras todo está corriendo)

curl http://localhost:4000/country
curl http://localhost:4000/order/
curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.agente@sbi.com","password":"cualquiera"}'
```

---

## Endpoints disponibles

| Método | Ruta                                                       | Descripción                    |
|--------|------------------------------------------------------------|--------------------------------|
| POST   | `/login`                                                   | Login                          |
| GET    | `/country`                                                 | Lista de países                |
| GET    | `/pax/`                                                    | Todos los pasajeros            |
| GET    | `/pax/:idorder`                                            | Pasajeros por orden            |
| GET    | `/pax/findpax/:id`                                         | Pasajero con orden populada    |
| POST   | `/pax/`                                                    | Crear pasajero                 |
| PUT    | `/pax/:id`                                                 | Actualizar pasajero            |
| GET    | `/order/`                                                  | Todas las órdenes              |
| GET    | `/order/:id`                                               | Obtener orden                  |
| POST   | `/order/`                                                  | Crear orden                    |
| PUT    | `/order/:id`                                               | Actualizar orden               |
| GET    | `/usuario/`                                                | Todos los sellers              |
| GET    | `/usuario/vendedor`                                        | Todos los sellers (alias)      |
| GET    | `/usuario/:correo`                                         | Seller por email               |
| GET    | `/usuario/seller/:id`                                      | Seller por id custom           |
| GET    | `/usuario/user/:nombre`                                    | Seller por nuser               |
| GET    | `/usuario/company/:nombre`                                 | Sellers por empresa            |
| POST   | `/usuario/`                                                | Crear seller                   |
| PUT    | `/usuario/:id`                                             | Actualizar seller              |
| DELETE | `/usuario/:id`                                             | Eliminar seller                |
| GET    | `/contactos/`                                              | Todos los contactos            |
| GET    | `/busqueda/pedido/:idcab`                                  | Orden + pasajeros              |
| GET    | `/busqueda/coleccion/:tabla/:idcab`                        | Búsqueda por colección         |
| GET    | `/busqueda/orders/:role/:agente/:fini/:ffin/:contact/:tm`  | Filtrar órdenes                |
| GET    | `/busqueda/mes/:idAgente`                                  | Agrupar por mes                |
| GET    | `/busqueda/cuentaTM/:idAgente`                             | Contar TMs por agente          |
| GET    | `/busqueda/cuentaTMs`                                      | Órdenes con tm_date_cruise     |
| GET    | `/upload`                                                  | Health upload                  |
| POST   | `/upload`                                                  | Subir archivo físico           |
| GET    | `/archivo/file/:carpeta/:archivo`                          | Servir archivo físico          |
| GET    | `/archivo/delete/:archivo`                                 | Eliminar archivo físico        |
| GET    | `/archivo/:idorder`                                        | Archivos por orden             |
| POST   | `/archivo/`                                                | Crear registro archivo         |
| PUT    | `/archivo/:id`                                             | Actualizar archivo             |
| DELETE | `/archivo/:idArchivo`                                      | Eliminar archivo               |
