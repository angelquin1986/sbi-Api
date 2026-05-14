package httpadapter

import (
	"gouland/internal/adapters/mongo"
	"gouland/internal/adapters/http/handlers"
	"gouland/internal/usecase"
	"github.com/gin-gonic/gin"
)

func NewRouter(db *mongoadapter.Mongo) *gin.Engine {
	r := gin.Default()

	// CORS middleware similar to original project
	r.Use(func(c *gin.Context) {
		allowed := map[string]bool{
			"https://experiencesouthamerica.travel": true,
			"https://www.experiencesouthamerica.travel": true,
		}
		origin := c.GetHeader("Origin")
		if allowed[origin] {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})

	// Health
	r.GET("/", func(c *gin.Context){ c.JSON(200, gin.H{"status":"ok","service":"gouland api"}) })

	// Instantiate repos and handlers
	countryRepo := mongoadapter.NewCountryRepo(db)
	countryHandler := handlers.NewCountryHandler(countryRepo)

	passengerRepo := mongoadapter.NewPassengerRepo(db)
	passengerHandler := handlers.NewPassengerHandler(passengerRepo)

	orderRepo := mongoadapter.NewOrderRepo(db)
	orderHandler := handlers.NewOrderHandler(orderRepo)

	contactRepo := mongoadapter.NewContactRepo(db)
	contactHandler := handlers.NewContactHandler(contactRepo)

	// auth handlers (use SellerRepo)
	sellerRepo := mongoadapter.NewSellerRepo(db)
	// create usecases
	sellerUC := usecase.NewSellerUsecase(sellerRepo)
	countryUC := usecase.NewCountryUsecase(countryRepo)
	passengerUC := usecase.NewPassengerUsecase(passengerRepo)
	orderUC := usecase.NewOrderUsecase(orderRepo)
	searchUC := usecase.NewSearchUsecase(orderRepo, passengerRepo, countryRepo)

	loginHandler := handlers.LoginHandler(sellerUC)
	registerHandler := handlers.RegisterHandler(sellerUC)

	// handlers that need usecases
	countryHandler = handlers.NewCountryHandler(countryUC)
	passengerHandler = handlers.NewPassengerHandler(passengerUC)
	orderHandler = handlers.NewOrderHandler(orderUC)

	api := r.Group("")
	countryGroup := api.Group("/country")
	countryHandler.Register(countryGroup)

	passengerGroup := api.Group("/pax")
	passengerHandler.Register(passengerGroup)

	orderGroup := api.Group("/order")
	orderHandler.Register(orderGroup)

	contactGroup := api.Group("/contactos")
	contactHandler.Register(contactGroup)

	// auth
	api.POST("/login", loginHandler)
	api.POST("/register", registerHandler)

	// upload and archivo
	api.POST("/upload", handlers.UploadHandler)
	archivoGroup := api.Group("/archivo")
	archivoGroup.GET("/", handlers.ArchivoListHandler)
	archivoGroup.GET("/:name", handlers.ArchivoDownloadHandler)

	// busqueda and usuario
	api.GET("/busqueda", handlers.BusquedaHandler(searchUC))

	usuarioGroup := api.Group("/usuario")
	usuarioGroup.GET("/", handlers.UsuarioListHandler(sellerUC))
	usuarioGroup.GET("/:id", handlers.UsuarioGetHandler(sellerUC))
	usuarioGroup.POST("/", handlers.UsuarioCreateHandler(sellerUC))
	usuarioGroup.PUT("/:id", handlers.UsuarioUpdateHandler(sellerUC))
	usuarioGroup.DELETE("/:id", handlers.UsuarioDeleteHandler(sellerUC))

	return r
}
