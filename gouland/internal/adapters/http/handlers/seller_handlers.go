package handlers

import (
	"net/http"
	"context"
	"fmt"

	"gouland/internal/domain"
	"gouland/internal/ports"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SellerHandler struct{ repo interface{} }

func NewSellerHandler(r interface{}) *SellerHandler { return &SellerHandler{repo: r} }

func (h *SellerHandler) Register(rg *gin.RouterGroup) {
	rg.GET("/", h.ListStub)
}

func (h *SellerHandler) ListStub(c *gin.Context) { c.JSON(200, gin.H{"message":"seller endpoints to implement"}) }
