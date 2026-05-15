package handlers

import (
"context"
"encoding/json"
"net/http"

"gouland/internal/domain"
"gouland/internal/usecase"

"github.com/gin-gonic/gin"
)

type PassengerHandler struct {
uc      usecase.PassengerUsecase
orderUC usecase.OrderUsecase
}

func NewPassengerHandler(u usecase.PassengerUsecase, oUC usecase.OrderUsecase) *PassengerHandler {
return &PassengerHandler{uc: u, orderUC: oUC}
}

func (h *PassengerHandler) Register(rg *gin.RouterGroup) {
rg.GET("", h.List)
rg.GET("/", h.List)
rg.GET("/findpax/:id", h.FindPax) // debe ir ANTES de /:idorder
rg.GET("/:idorder", h.GetByOrderID)
rg.POST("", h.Create)
rg.POST("/", h.Create)
rg.PUT("/:id", h.Update)
}

func (h *PassengerHandler) List(c *gin.Context) {
items, err := h.uc.List(context.Background())
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargando passenger", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "passengers": items})
}

func (h *PassengerHandler) GetByOrderID(c *gin.Context) {
idorder := c.Param("idorder")
passengers, err := h.uc.GetByOrderID(context.Background(), idorder)
if err != nil {
c.JSON(http.StatusOK, gin.H{"ok": true, "passengers": []interface{}{}, "mensaje": "ddd"})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "passengers": passengers, "mensaje": "ddd"})
}

// FindPax — GET /pax/findpax/:id — retorna passenger con pax_id_order populado (igual que Node.js .populate)
func (h *PassengerHandler) FindPax(c *gin.Context) {
id := c.Param("id")
pax, err := h.uc.Get(context.Background(), id)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{
"ok":      false,
"mensaje": "El passenger con el id " + id + " no existe",
"errors":  map[string]string{"message": "No existe un passenger con ese ID"},
})
return
}

// Serialize passenger to map so we can replace pax_id_order with populated Order
raw, _ := json.Marshal(pax)
var paxMap map[string]interface{}
json.Unmarshal(raw, &paxMap)

// Populate pax_id_order with full Order document (matching Mongoose .populate behavior)
if h.orderUC != nil && !pax.PaxIdOrder.IsZero() {
order, err := h.orderUC.Get(context.Background(), pax.PaxIdOrder.Hex())
if err == nil {
paxMap["pax_id_order"] = order
}
}

c.JSON(http.StatusOK, gin.H{"ok": true, "passenger": paxMap})
}

func (h *PassengerHandler) Create(c *gin.Context) {
var payload domain.Passenger
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al crear passenger", "errors": err.Error()})
return
}
if err := h.uc.Create(context.Background(), &payload); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al crear passenger", "errors": err.Error()})
return
}
c.JSON(http.StatusCreated, gin.H{"ok": true, "passenger": payload})
}

func (h *PassengerHandler) Update(c *gin.Context) {
id := c.Param("id")
var payload domain.Passenger
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al actualizar passenger", "errors": err.Error()})
return
}
saved, err := h.uc.Update(context.Background(), id, &payload)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al actualizar passenger", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "passenger": saved})
}
