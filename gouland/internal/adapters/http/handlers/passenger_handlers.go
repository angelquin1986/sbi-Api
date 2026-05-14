package handlers

import (
	"net/http"
	"context"

	"gouland/internal/domain"
	"gouland/internal/usecase"

	"github.com/gin-gonic/gin"
)

// PassengerHandler is thin and delegates to usecase
type PassengerHandler struct{ uc usecase.PassengerUsecase }

func NewPassengerHandler(u usecase.PassengerUsecase) *PassengerHandler { return &PassengerHandler{uc: u} }

func (h *PassengerHandler) Register(rg *gin.RouterGroup) {
	rg.GET("/", h.List)
	rg.GET("/:id", h.Get)
	rg.POST("/", h.Create)
	rg.PUT("/:id", h.Update)
	rg.DELETE("/:id", h.Delete)
}

func (h *PassengerHandler) List(c *gin.Context) {
	ctx := context.Background()
	items, err := h.uc.List(ctx)
	if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargando passenger", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "passengers": items})
}

func (h *PassengerHandler) Get(c *gin.Context) {
	id := c.Param("id")
	res, err := h.uc.Get(context.Background(), id)
	if err != nil { c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al buscar passenger", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "passenger": res})
}

func (h *PassengerHandler) Create(c *gin.Context) {
	var payload domain.Passenger
	if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al crear passenger", "errors": err.Error()}); return }
	if err := h.uc.Create(context.Background(), &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al crear passenger", "errors": err.Error()}); return }
	c.JSON(http.StatusCreated, gin.H{"ok": true, "passenger": payload})
}

func (h *PassengerHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var payload domain.Passenger
	if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al actualizar passenger", "errors": err.Error()}); return }
	if err := h.uc.Update(context.Background(), id, &payload); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al actualizar passenger", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "passenger": payload})
}

func (h *PassengerHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.uc.Delete(context.Background(), id); err != nil { c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al borrar passenger", "errors": err.Error()}); return }
	c.JSON(http.StatusOK, gin.H{"ok": true, "mensaje": "deleted"})
}
