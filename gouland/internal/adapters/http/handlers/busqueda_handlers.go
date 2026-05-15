package handlers

import (
"net/http"

"gouland/internal/usecase"

"github.com/gin-gonic/gin"
)

func BusquedaHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
q := c.Query("q")
if q == "" {
c.JSON(http.StatusBadRequest, gin.H{"error": "q query required"})
return
}
res, _ := s.SearchAll(c.Request.Context(), q)
c.JSON(http.StatusOK, res)
}
}

func BusquedaPedidoHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
idcab := c.Param("idcab")
res, _ := s.GetPedido(c.Request.Context(), idcab)
c.JSON(http.StatusOK, res)
}
}

func BusquedaColeccionHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
tabla := c.Param("tabla")
idcab := c.Param("idcab")
res, _ := s.GetColeccion(c.Request.Context(), tabla, idcab)
if ok, exists := res["ok"]; exists && ok == false {
c.JSON(http.StatusBadRequest, res)
return
}
c.JSON(http.StatusOK, res)
}
}

func BusquedaOrdersHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
roleAgente := c.Param("roleAgente")
idAgente := c.Param("idAgente")
fini := c.Param("fini")
ffin := c.Param("ffin")
nameContact := c.Param("nameContact")
tm := c.Param("tm")
res, _ := s.GetOrdersFiltered(c.Request.Context(), roleAgente, idAgente, fini, ffin, nameContact, tm)
c.JSON(http.StatusOK, res)
}
}

func BusquedaMesHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
idAgente := c.Param("idAgente")
res, _ := s.GetOrdersByMes(c.Request.Context(), idAgente)
c.JSON(http.StatusOK, res)
}
}

func BusquedaCuentaTMHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
idAgente := c.Param("idAgente")
res, _ := s.GetCuentaTM(c.Request.Context(), idAgente)
c.JSON(http.StatusOK, res)
}
}

func BusquedaCuentaTMsHandler(s usecase.SearchUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
res, _ := s.GetCuentaTMs(c.Request.Context())
c.JSON(http.StatusOK, res)
}
}
