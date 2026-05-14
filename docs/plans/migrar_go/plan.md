Plan de migración: "migrar_go"

Progreso actual
- Análisis del repo original completado y guardado en plan inicial.
- README del repo creado con el análisis (/README.md).
- Scaffold Go creado en /gouland con estructura hexagonal básica, Dockerfile, docker-compose.yml y ejemplo de migración.
- Implementación inicial: models (domain), interfaz de repositorio (ports), adaptador Mongo y CRUD para /country (repo y handlers).
- Implementación extendida: handlers/repos para /pax, /order, /contactos, /usuario, /login, /register, /upload, /archivo, /busqueda.
- Implementadas validaciones de campos requeridos en Passenger, Order y Seller para replicar mensajes del proyecto Node.
- Migrator básico y cmd/migrate listo; Dockerfile ejecuta migraciones antes de iniciar la API.
- Swagger OpenAPI inicial (gouland/docs/swagger.yaml) generado parcialmente.

Objetivo
- Migrar el proyecto existente (SBI API - Node.js/Express + Mongoose) a un proyecto en Go (carpeta: gouland en la raíz del repo) manteniendo funcionalidad idéntica: mismos endpoints, mismas colecciones/tablas en Mongo, misma conexión a Mongo (URI configurable), misma lógica de negocio y comportamiento.

Pendientes importantes
- Completar Swagger/OpenAPI con todas las rutas, schemas y ejemplos.
- Migrator versionado e idempotente (colección schema_migrations y control de versiones).
- Pruebas unitarias e integración (Go test + e2e con docker-compose).
- Revisión y testeo end-to-end para asegurar paridad completa de respuestas y errores.

Siguiente paso
- Ejecutar pruebas locales con docker-compose y ajustar desviaciones (sigo si confirmas).

