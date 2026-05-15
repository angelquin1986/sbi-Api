package main

import (
	"log"

	"gouland/config"
	httpadapter "gouland/internal/adapters/http"
	mongoadapter "gouland/internal/adapters/mongo"
)

func main() {
	cfg := config.Load()

	// Initialize adapters
	mongoAdapter, err := mongoadapter.New(cfg.MongodbURI)
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	defer mongoAdapter.Disconnect()

	// Start HTTP server
	handler := httpadapter.NewRouter(mongoAdapter)
	if err := handler.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
