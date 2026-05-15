package handlers

import (
"net/http"

"gouland/internal/domain"
"gouland/internal/usecase"

"github.com/gin-gonic/gin"
)

type ContactHandler struct{ uc usecase.ContactUsecase }

func NewContactHandler(u usecase.ContactUsecase) *ContactHandler { return &ContactHandler{uc: u} }

func (h *ContactHandler) Register(rg *gin.RouterGroup) {
rg.GET("", h.List)
rg.GET("/", h.List)
}

func (h *ContactHandler) List(c *gin.Context) {
items, err := h.uc.List(c.Request.Context())
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar info seller", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "contact": items})
}

func (h *ContactHandler) Create(c *gin.Context) {
var payload domain.Contact
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}
if err := h.uc.Create(c.Request.Context(), &payload); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
return
}
c.JSON(http.StatusCreated, payload)
}
