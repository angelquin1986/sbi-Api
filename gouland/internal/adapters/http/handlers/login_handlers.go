package handlers

import (
	"net/http"
	"context"

	"gouland/internal/domain"
	"gouland/internal/usecase"

	"github.com/gin-gonic/gin"
)

// Login payload
type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		var p LoginPayload
		if err := c.ShouldBindJSON(&p); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"ok":      true,
			"mensaje": "Login post realizada correctamente...",
			"body":    p,
		})
	}
}

func RegisterHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload domain.Seller
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if err := u.Create(context.Background(), &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		payload.Password = ""
		c.JSON(http.StatusCreated, gin.H{"user": payload})
	}
}
