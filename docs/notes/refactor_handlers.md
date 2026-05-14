Refactor: Handlers -> Ports/Repos (hexagonal)

Resumen de cambios
- Objetivo: eliminar acceso directo al cliente Mongo desde handlers (capa HTTP). Inyectar repositorios (ports) para mantener handlers delgados y respetar arquitectura hexagonal.

Archivos modificados (principales)
- internal/ports/repository.go: añadidas interfaces SellerRepo, PassengerRepo, OrderRepo y Search() en repos relevantes.
- internal/adapters/mongo/repo_seller.go: ahora implementa ports.SellerRepo, añadidos métodos GetAll y GetByID.
- internal/adapters/mongo/repo_passenger.go: ahora implementa ports.PassengerRepo y Search.
- internal/adapters/mongo/repo_order.go: ahora implementa ports.OrderRepo y Search.
- internal/adapters/mongo/repo_country.go: añadido Search.
- internal/adapters/http/handlers/login_handlers.go: LoginHandler/RegisterHandler ahora reciben ports.SellerRepo en lugar de *mongoadapter.Mongo.
- internal/adapters/http/handlers/usuario_handlers.go: CRUD de usuario ahora usa ports.SellerRepo.
- internal/adapters/http/handlers/busqueda_handlers.go: ahora usa repos OrderRepo, PassengerRepo y CountryRepo para búsquedas.
- internal/adapters/http/router.go: wiring actualizado para inyectar repos creados por mongoadapter (NewSellerRepo, NewOrderRepo, ...).

Notas
- No se han levantado contenedores ni ejecutado la aplicación.
- Se mantuvieron las colecciones y nombres de base (bookingDB) para compatibilidad.
- Próximos pasos: probar compilación (go build), ejecutar tests y luego iniciar docker-compose con Mongo para validar comportamiento.
