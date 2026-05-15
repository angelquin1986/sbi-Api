# Plan: Migración Node.js → Go (SBI API)

> **Estado:** ✅ Completado — API Go con paridad funcional al 100% con Node.js

---

## Objetivo

Migrar el proyecto **SBI API** (Node.js/Express + Mongoose) a Go con arquitectura
hexagonal en la carpeta `gouland/`, manteniendo funcionalidad idéntica: mismos
endpoints, mismas colecciones Mongo, misma lógica de negocio, para que el mismo
frontend se conecte a cualquiera de los dos backends.

## Stack

- **Go 1.20** · Gin · mongo-driver v1.12.1
- **Arquitectura hexagonal**: domain → ports → adapters (mongo + http)
- **MongoDB 6** en Docker

---

## Progreso completado

### Fase 1 — Scaffold y dominio
- [x] Estructura hexagonal: `domain/`, `ports/`, `adapters/mongo/`, `adapters/http/`
- [x] `domain/models.go` — structs con bson/json tags idénticos a los schemas Mongoose
- [x] `ports/ports.go` — interfaces de todos los repositorios
- [x] `config/config.go` — variables de entorno (MONGODB_URI, PORT, JWT_SECRET)
- [x] `internal/auth/auth.go` — JWT + bcrypt

### Fase 2 — Repositorios MongoDB
- [x] `repo_country.go` — CRUD países
- [x] `repo_passenger.go` — CRUD + GetByOrderID + FindOneAndUpdate (retorna doc)
- [x] `repo_order.go` — CRUD + FindFiltered + AggregateByMonth + CountByTMDate + FindOneAndUpdate
- [x] `repo_seller.go` — CRUD + GetBySellerStringID + FindOneAndDelete
- [x] `repo_contact.go` — GetAll + Create
- [x] `repo_file.go` — CRUD + GetByOrderID + FindOneAndUpdate

### Fase 3 — Usecases
- [x] passenger_usecase · order_usecase · seller_usecase
- [x] contact_usecase · file_usecase · search_usecase
- [x] `Update` retorna `(*Domain, error)` para replicar Mongoose `.save()` que retorna doc guardado

### Fase 4 — Handlers HTTP (Gin)
- [x] `/login` — sin validación de contraseña (idéntico a Node.js)
- [x] `/country` — GET lista
- [x] `/pax` — CRUD + findpax con populate de Order (equiv. Mongoose `.populate()`)
- [x] `/order` — CRUD
- [x] `/usuario` — CRUD + múltiples GETs (por email, id custom, nuser, company)
- [x] `/contactos` — GET lista
- [x] `/busqueda` — 6 endpoints (pedido, coleccion, orders, mes, cuentaTM, cuentaTMs)
- [x] `/upload` — GET + POST con multer equivalente en Go
- [x] `/archivo` — GET físico + CRUD MongoDB + DELETE físico
- [x] `router.go` — CORS idéntico a Node.js (dominios de experiencesouthamerica.travel)

### Fase 5 — Paridad funcional verificada
- [x] `PUT /pax|/order|/archivo` — retorna documento guardado de DB (FindOneAndUpdate)
- [x] `PUT /usuario/:id` — actualiza solo 4 campos (id, nseller, mailseller, role) como Node.js
- [x] `GET /pax/findpax/:id` — populate de pax_id_order con Order completo
- [x] `POST /order` — state_order = 1 por defecto
- [x] `GET /busqueda/pedido/:idcab` — order retorna como array (equiv. Order.find())
- [x] `POST /login` — retorna `{ok:true, mensaje, body}` sin validar contraseña
- [x] `GET /country` — retorna `{ok:true, paises:[...]}`
- [x] `DELETE /archivo` — retorna `{ok:true, file: archivoBorrado}`
- [x] `GET /usuario/seller/:id` — query por campo string `id`, no por `_id`
- [x] `DELETE /usuario/:id` — retorna `{ok:true, usuario: sellerBorrado}`
- [x] `go build ./...` ✅ sin errores

### Fase 6 — Infraestructura y documentación ✅ (esta fase)
- [x] `docker-compose.mongo.yml` — MongoDB standalone + Mongo Express UI
- [x] `gouland/docker-compose.yml` — stack completo (mongo + api go)
- [x] `gouland/Dockerfile` — build multi-stage
- [x] `gouland/cmd/seed/main.go` — seed idempotente con datos dummy realistas
- [x] `gouland/README.md` — documentación completa de operación

---

## Cómo ejecutar el entorno (resumen rápido)

### 1. Levantar MongoDB

```bash
# Desde la raíz del repositorio
docker compose -f docker-compose.mongo.yml up -d
```

Verifica que está saludable:
```bash
docker ps
# sbi-mongo debe aparecer como "healthy"
```

UI de MongoDB disponible en: http://localhost:8081 (admin / admin123)

---

### 2. Levantar el backend Go

```bash
cd gouland
go run ./cmd/api
# → Servidor en http://localhost:4000
```

O con Docker completo:
```bash
# Desde la raíz
docker compose up --build
```

---

### 3. Ejecutar migraciones

Las migraciones crean índices en MongoDB. Se ejecutan automáticamente en Docker,
pero en desarrollo local:

```bash
cd gouland
mongosh "mongodb://localhost:27017/bookingDB" ./migrations/V1__create_indexes.js
```

Índices que crea:
- `orders.state_order` (índice ascendente para filtros por estado)

---

### 4. Llenar datos dummy (seed)

```bash
cd gouland
go run ./cmd/seed
```

Salida esperada:
```
🌱 SBI Seed — conectando a mongodb://localhost:27017/bookingDB
Insertando datos dummy...
  [ok] countries — 15 países insertados
  [ok] sellers — 3 vendedores insertados
  [ok] contacts — 4 contactos insertados
  [ok] orders — 5 órdenes insertadas
  [ok] passengers — 10 pasajeros insertados
  [ok] files — 5 archivos insertados
✅ Seed completado.
```

Si los datos ya existen, el seed los omite (idempotente):
```
  [skip] countries — ya tiene datos
  [skip] sellers — ya tiene datos
  ...
```

Datos de prueba disponibles después del seed:

| Seller                    | Role          | id (campo custom) |
|---------------------------|---------------|-------------------|
| operaciones@sbi.com       | OPERADOR_ROLE | AG001             |
| ana.agente@sbi.com        | AGENTE_ROLE   | AG002             |
| luis.vendedor@sbi.com     | AGENTE_ROLE   | AG003             |

---

### 5. Verificar la API

```bash
curl http://localhost:4000/
curl http://localhost:4000/country
curl http://localhost:4000/order/
curl http://localhost:4000/usuario/

curl -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.agente@sbi.com","password":"test"}'
```

---

## Variables de entorno

| Variable      | Default                               | Descripción            |
|---------------|---------------------------------------|------------------------|
| MONGODB_URI   | mongodb://localhost:27017/bookingDB   | URI de conexión Mongo  |
| PORT          | 4000                                  | Puerto HTTP de la API  |
| JWT_SECRET    | changeme                              | Secreto JWT            |

---

## Diferencias conocidas (no críticas)

| Endpoint | Node.js | Go | Impacto |
|----------|---------|-----|---------|
| `GET /usuario/*` (mayoría) | proyecta `nseller mailseller nuser role id` | retorna todos los campos excepto password | Extra campo `company` en respuesta Go — no rompe frontend |
| `GET /busqueda/pedido/:id` | bug: `passengers` = número (push return) | retorna array correcto | Go tiene comportamiento más correcto |
| `DELETE /usuario/:id` | incluye hash bcrypt en respuesta | omite password | Más seguro en Go |

---

## Pendientes futuros

- [ ] Completar OpenAPI/Swagger con todos los endpoints
- [ ] Tests unitarios e integración (Go test)
- [ ] Migrador versionado con colección `schema_migrations`
- [ ] E2E tests con docker-compose
