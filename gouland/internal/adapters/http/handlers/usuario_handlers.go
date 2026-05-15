package handlers

import (
"context"
"net/http"

"gouland/internal/domain"
"gouland/internal/usecase"

"github.com/gin-gonic/gin"
)

func UsuarioListHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
out, err := u.GetAll(context.Background())
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar seller", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuarios": out})
}
}

// GET /usuario/vendedor — idéntico a list
func UsuarioVendedorHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
out, err := u.GetAll(context.Background())
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar seller", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuarios": out})
}
}

// GET /usuario/seller/:id — busca por campo id (string), igual que Node.js Seller.find({id: id})
func UsuarioGetBySellerIDHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
id := c.Param("id")
results, err := u.GetBySellerStringID(context.Background(), id)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar info seller", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuario": results})
}
}

// GET /usuario/user/:nombre
func UsuarioGetByNUserHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
nombre := c.Param("nombre")
out, err := u.GetByNUser(context.Background(), nombre)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar info seller por nombre user", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuario": out})
}
}

// GET /usuario/company/:nombre
func UsuarioGetByCompanyHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
nombre := c.Param("nombre")
out, err := u.GetByCompany(context.Background(), nombre)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar seller by company", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuarios": out})
}
}

// GET /usuario/:id — busca por email (mailseller) igual que Node.js /:correo
func UsuarioGetHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
correo := c.Param("id")
s, err := u.GetByEmail(context.Background(), correo)
if err != nil || s == nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar seller", "errors": "not found"})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuarios": []interface{}{s}})
}
}

func UsuarioCreateHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
var payload domain.Seller
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}
errs := validateSeller(&payload)
if len(errs) > 0 {
c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al crear seller", "errors": errs})
return
}
if existing, _ := u.GetByEmail(context.Background(), payload.MailSeller); existing != nil {
c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "El correo ya existe", "errors": map[string]string{"email": "email debe ser unico"}})
return
}
if err := u.Create(context.Background(), &payload); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
return
}
payload.Password = ""
c.JSON(http.StatusCreated, gin.H{"ok": true, "usuario": payload})
}
}

func UsuarioUpdateHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
id := c.Param("id")
var payload domain.Seller
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}
if err := u.Update(context.Background(), id, &payload); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
return
}
payload.Password = ":)"
c.JSON(http.StatusOK, gin.H{"ok": true, "usuario": payload})
}
}

func UsuarioDeleteHandler(u usecase.SellerUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
id := c.Param("id")
sellerBorrado, err := u.Delete(context.Background(), id)
if err != nil {
c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al borrar seller", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "usuario": sellerBorrado})
}
}

func validateSeller(s *domain.Seller) map[string]string {
errs := map[string]string{}
if s.NSeller == "" {
errs["nseller"] = "El nombre es necesario"
}
if s.MailSeller == "" {
errs["mailseller"] = "El correo es necesario"
}
return errs
}
