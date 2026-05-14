package handlers

import (
	"gouland/internal/domain"
	"gouland/internal/usecase"
	"net/http"

	"github.com/gin-gonic/gin"
)

// small wrapper to register country routes when router builds
type CountryHandlerShim struct {
	repo interface {
		GetAll(ctx interface{}) ([]domain.Country, error)
	}
}

// NOTE: actual handler implemented in handlers_country.go; this file kept for package cohesion
func placeholderCountry(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "country not wired"})
}

// helper to create country handler using mongo adapter
func NewCountryHandler(u usecase.CountryUsecase) *CountryHandler { return &CountryHandler{uc: u} }

// CountryHandler now depends on usecase
type CountryHandler struct{ uc usecase.CountryUsecase }

func (h *CountryHandler) Register(rg *gin.RouterGroup) {
	rg.GET("/", h.List)
	rg.GET("/:id", h.Get)
	rg.POST("/", h.Create)
	rg.PUT("/:id", h.Update)
	rg.DELETE("/:id", h.Delete)
}

func (h *CountryHandler) List(c *gin.Context) {
	out, err := h.uc.List(c.Request.Context())
	if err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
	c.JSON(200, out)
}

func (h *CountryHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.uc.Get(c.Request.Context(), id)
	if err != nil { c.JSON(404, gin.H{"error": "not found"}); return }
	c.JSON(200, res)
}

func (h *CountryHandler) Create(c *gin.Context) {
	var payload domain.Country
	if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
	if err := h.uc.Create(c.Request.Context(), &payload); err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
	c.JSON(201, payload)
}

func (h *CountryHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var payload domain.Country
	if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(400, gin.H{"error": err.Error()}); return }
	if err := h.uc.Update(c.Request.Context(), id, &payload); err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
	c.JSON(200, gin.H{"status": "updated"})
}

func (h *CountryHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.uc.Delete(c.Request.Context(), id); err != nil { c.JSON(500, gin.H{"error": err.Error()}); return }
	c.JSON(200, gin.H{"status": "deleted"})
}
