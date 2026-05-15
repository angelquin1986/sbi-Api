package httpadapter

import (
"gouland/internal/adapters/http/handlers"
mongoadapter "gouland/internal/adapters/mongo"
"gouland/internal/usecase"

"github.com/gin-gonic/gin"
)

// setCORSHeaders sets CORS on any ResponseWriter — used both in middleware and NoRoute/NoMethod handlers
func setCORSHeaders(w gin.ResponseWriter) {
w.Header().Set("Access-Control-Allow-Origin", "*")
w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD")
w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token")
w.Header().Set("Access-Control-Max-Age", "0")
}

func NewRouter(db *mongoadapter.Mongo) *gin.Engine {
r := gin.Default()
r.HandleMethodNotAllowed = true

// CORS middleware — runs for all registered routes
r.Use(func(c *gin.Context) {
setCORSHeaders(c.Writer)
if c.Request.Method == "OPTIONS" {
	c.AbortWithStatus(204)
	return
}
c.Next()
})

// NoRoute (404) — also needs CORS so browser doesn't block the response
r.NoRoute(func(c *gin.Context) {
setCORSHeaders(c.Writer)
c.JSON(404, gin.H{"error": "not found"})
})

// NoMethod (405) — HEAD on a GET-only route hits here; return 200 empty for HEAD
r.NoMethod(func(c *gin.Context) {
setCORSHeaders(c.Writer)
if c.Request.Method == "HEAD" {
	c.Status(200)
	return
}
c.JSON(405, gin.H{"error": "method not allowed"})
})

// Health / root
r.GET("/", func(c *gin.Context) {
c.JSON(200, gin.H{
"ok":      true,
"mensaje": "Peticion realizada correctamente...al servidor backend SBI de Experience Southamerica...!!",
})
})

// Repos
countryRepo := mongoadapter.NewCountryRepo(db)
passengerRepo := mongoadapter.NewPassengerRepo(db)
orderRepo := mongoadapter.NewOrderRepo(db)
contactRepo := mongoadapter.NewContactRepo(db)
sellerRepo := mongoadapter.NewSellerRepo(db)
fileRepo := mongoadapter.NewFileRepo(db)

// Usecases
countryUC := usecase.NewCountryUsecase(countryRepo)
passengerUC := usecase.NewPassengerUsecase(passengerRepo)
orderUC := usecase.NewOrderUsecase(orderRepo)
sellerUC := usecase.NewSellerUsecase(sellerRepo)
contactUC := usecase.NewContactUsecase(contactRepo)
fileUC := usecase.NewFileUsecase(fileRepo)
searchUC := usecase.NewSearchUsecase(orderRepo, passengerRepo, countryRepo)

// Handlers
countryHandler := handlers.NewCountryHandler(countryUC)
passengerHandler := handlers.NewPassengerHandler(passengerUC, orderUC)
orderHandler := handlers.NewOrderHandler(orderUC)
contactHandler := handlers.NewContactHandler(contactUC)

// /login
r.POST("/login", handlers.LoginHandler(sellerUC))

// /country CRUD
countryGroup := r.Group("/country")
countryHandler.Register(countryGroup)

// /pax — GET /, GET /findpax/:id, GET /:idorder, POST /, PUT /:id
paxGroup := r.Group("/pax")
passengerHandler.Register(paxGroup)

// /order CRUD
orderGroup := r.Group("/order")
orderHandler.Register(orderGroup)

// /contactos GET
contactGroup := r.Group("/contactos")
contactHandler.Register(contactGroup)

// /usuario — múltiples GET + CRUD (rutas específicas antes de /:id)
usuarioGroup := r.Group("/usuario")
usuarioGroup.GET("", handlers.UsuarioListHandler(sellerUC))
usuarioGroup.GET("/", handlers.UsuarioListHandler(sellerUC))
usuarioGroup.GET("/vendedor", handlers.UsuarioVendedorHandler(sellerUC))
usuarioGroup.GET("/seller/:id", handlers.UsuarioGetBySellerIDHandler(sellerUC))
usuarioGroup.GET("/user/:nombre", handlers.UsuarioGetByNUserHandler(sellerUC))
usuarioGroup.GET("/company/:nombre", handlers.UsuarioGetByCompanyHandler(sellerUC))
usuarioGroup.GET("/:id", handlers.UsuarioGetHandler(sellerUC))
usuarioGroup.POST("", handlers.UsuarioCreateHandler(sellerUC))
usuarioGroup.POST("/", handlers.UsuarioCreateHandler(sellerUC))
usuarioGroup.PUT("/:id", handlers.UsuarioUpdateHandler(sellerUC))
usuarioGroup.DELETE("/:id", handlers.UsuarioDeleteHandler(sellerUC))

// /busqueda — 6 endpoints específicos + búsqueda genérica
busquedaGroup := r.Group("/busqueda")
busquedaGroup.GET("/pedido/:idcab", handlers.BusquedaPedidoHandler(searchUC))
busquedaGroup.GET("/coleccion/:tabla/:idcab", handlers.BusquedaColeccionHandler(searchUC))
busquedaGroup.GET("/orders/:roleAgente/:idAgente/:fini/:ffin/:nameContact/:tm", handlers.BusquedaOrdersHandler(searchUC))
busquedaGroup.GET("/mes/:idAgente", handlers.BusquedaMesHandler(searchUC))
busquedaGroup.GET("/cuentaTM/:idAgente", handlers.BusquedaCuentaTMHandler(searchUC))
busquedaGroup.GET("/cuentaTMs", handlers.BusquedaCuentaTMsHandler(searchUC))

// /upload
r.GET("/upload", handlers.UploadGetHandler)
r.POST("/upload", handlers.UploadHandler)

// /archivo — file físico + CRUD MongoDB (rutas específicas antes de /:idorder)
archivoGroup := r.Group("/archivo")
archivoGroup.GET("/file/:carpeta/:archivo", handlers.ArchivoFileHandler)
archivoGroup.GET("/delete/:archivo", handlers.ArchivoDeleteFisico)
archivoGroup.GET("/:idorder", handlers.ArchivoListByOrderHandler(fileUC))
archivoGroup.POST("/", handlers.ArchivoCreateHandler(fileUC))
archivoGroup.PUT("/:id", handlers.ArchivoUpdateHandler(fileUC))
archivoGroup.DELETE("/:idArchivo", handlers.ArchivoDeleteHandler(fileUC))

return r
}
