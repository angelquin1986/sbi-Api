gouland - Go migration scaffold for SBI API

Summary
- Hexagonal architecture scaffold for migrating the existing Node.js API to Go.
- Uses Gin for HTTP and the official MongoDB Go driver.

Infra adapters
- Mongo adapter: /gouland/internal/adapters/mongo (repositorios que implementan interfaces de domain)
- HTTP adapter: /gouland/internal/adapters/http (routing y handlers)
- Storage adapter (local filesystem): /gouland/internal/adapters/storage (implementa la interfaz ports.Storage)

Quickstart (dev)
1. Build: docker compose build
2. Start: docker compose up
3. API available at http://localhost:4000

Notes
- This scaffold provides placeholders for endpoints mirroring the original project (/login, /country, /pax, /order, /usuario, /contactos, /busqueda, /upload, /archivo).
- Implement domain logic, repositories, and handlers to match exact behavior.
