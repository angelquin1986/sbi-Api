package handlers

import (
	"net/http"
	"context"

	"gouland/internal/domain"
	"gouland/internal/usecase"

	"github.com/gin-gonic/gin"
)

// OrderHandler delegates to order usecase
type OrderHandler struct{ uc usecase.OrderUsecase }

func NewOrderHandler(u usecase.OrderUsecase) *OrderHandler { return &OrderHandler{uc: u} }

func (h *OrderHandler) Register(rg *gin.RouterGroup) {
	rg.GET("/", h.List)
	rg.GET("/:id", h.Get)
	rg.POST("/", h.Create)
	rg.PUT("/:id", h.Update)
	rg.DELETE("/:id", h.Delete)
}

func (h *OrderHandler) List(c *gin.Context) {
	ctx := context.Background()
	items, err := h.uc.List(ctx)
	if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargando orders", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "orders": items})
}

func (h *OrderHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.uc.Get(context.Background(), id)
	if err != nil { c.JSON(http.StatusOK, gin.H{"ok": false, "mensaje": "Error al buscar cabecera order", "errors": err.Error(), "order": []interface{}{}}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "order": res})
}

func (h *OrderHandler) Create(c *gin.Context) {
	var payload domain.Order
	if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al crear order", "errors": err.Error()}); return }
	if err := h.uc.Create(context.Background(), &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al crear order", "errors": err.Error()}); return }
	c.JSON(http.StatusCreated, gin.H{"ok": true, "order": payload})
}

func (h *OrderHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var payload domain.Order
	if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al actualizar order", "errors": err.Error()}); return }
	if err := h.uc.Update(context.Background(), id, &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al actualizar order", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "order": payload})
}

func (h *OrderHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.uc.Delete(context.Background(), id); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al borrar order", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "mensaje": "deleted"})
}
