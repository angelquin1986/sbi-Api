package handlers

import (
	"net/http"
	"context"

	"gouland/internal/domain"
	"gouland/internal/usecase"

	"github.com/gin-gonic/gin"
)

func validateSeller(s *domain.Seller) map[string]string {
	errs := map[string]string{}
	if s.Name == "" { errs["name"] = "El nombre es necesario" }
	if s.Email == "" { errs["email"] = "El correo es necesario" }
	return errs
}

// Usuario CRUD via SellerRepo
func UsuarioListHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		out, err := u.GetAll(ctx)
		if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, out)
	}
}

func UsuarioGetHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		s, err := u.GetByID(context.Background(), id)
		if err != nil || s == nil { c.JSON(http.StatusNotFound, gin.H{"error":"not found"}); return }
		c.JSON(http.StatusOK, s)
	}
}

func UsuarioCreateHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload domain.Seller
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		// validate
		errs := validateSeller(&payload)
		if len(errs) > 0 { c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al crear seller", "errors": errs}); return }
		// check unique email
		if existing, _ := u.GetByEmail(context.Background(), payload.Email); existing != nil {
			c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "El correo ya existe", "errors": map[string]string{"email": "email debe ser unico"}})
			return
		}
		if err := u.Create(context.Background(), &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		payload.Password = ""
		c.JSON(http.StatusCreated, payload)
	}
}

func UsuarioUpdateHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var payload domain.Seller
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if err := u.Update(context.Background(), id, &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, gin.H{"status":"updated"})
	}
}

func UsuarioDeleteHandler(u usecase.SellerUsecase) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		if err := u.Delete(context.Background(), id); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, gin.H{"status":"deleted"})
	}
}
