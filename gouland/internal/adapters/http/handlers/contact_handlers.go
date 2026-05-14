package handlers

import (
	"net/http"
	"context"

	"gouland/internal/domain"
	"gouland/internal/ports"

	"github.com/gin-gonic/gin"
)

type ContactHandler struct{ repo interface{} }

func NewContactHandler(r interface{}) *ContactHandler { return &ContactHandler{repo: r} }

func (h *ContactHandler) Register(rg *gin.RouterGroup) {
	rg.GET("/", h.List)
	rg.POST("/", h.Create)
}

func (h *ContactHandler) List(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"message":"list contacts not wired"}) }
func (h *ContactHandler) Create(c *gin.Context) { var payload domain.Contact; if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }; c.JSON(http.StatusCreated, payload) }
