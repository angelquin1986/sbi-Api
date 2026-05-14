package config

import (
	"os"
)

type Config struct {
	Port string
	MongodbURI string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		uri = "mongodb://localhost:27017/bookingDB"
	}
	return &Config{Port: port, MongodbURI: uri}
}
