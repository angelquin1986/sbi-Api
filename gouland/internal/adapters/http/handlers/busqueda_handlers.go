package handlers

import (
	"net/http"
	"context"

	"gouland/internal/usecase"

	"github.com/gin-gonic/gin"
)

// BusquedaHandler searches across orders, passengers and countries via their repos
func BusquedaHandler(s usecase.SearchUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		q := c.Query("q")
		if q == "" { c.JSON(http.StatusBadRequest, gin.H{"error":"q query required"}); return }
		ctx := context.Background()
		res, _ := s.SearchAll(ctx, q)
		c.JSON(http.StatusOK, res)
	}
}
