package handlers

import (
"net/http"
"os"
"path/filepath"
"strings"

"gouland/internal/domain"
"gouland/internal/usecase"

"github.com/gin-gonic/gin"
)

// GET /archivo/file/:carpeta/:archivo — sirve archivo físico según extensión
func ArchivoFileHandler(c *gin.Context) {
carpeta := c.Param("carpeta")
archivo := c.Param("archivo")
ext := strings.ToLower(filepath.Ext(archivo))
if len(ext) > 0 {
ext = ext[1:]
}
pathArchivo := filepath.Join("/opt", carpeta, archivo)

switch ext {
case "jpg", "png", "jpeg":
c.File(pathArchivo)
return
case "doc", "docx":
icon := filepath.Join("/app/opciones", "word.ico")
if _, err := os.Stat(icon); err == nil {
c.File(icon)
return
}
case "pdf":
icon := filepath.Join("/app/opciones", "pdf.png")
if _, err := os.Stat(icon); err == nil {
c.File(icon)
return
}
}
icon := filepath.Join("/app/opciones", "file.png")
if _, err := os.Stat(icon); err == nil {
c.File(icon)
return
}
if _, err := os.Stat(pathArchivo); err == nil {
c.File(pathArchivo)
return
}
c.JSON(http.StatusNotFound, gin.H{"ok": false, "error": "not found"})
}

// GET /archivo/delete/:archivo — elimina archivo físico de doc_temporales
func ArchivoDeleteFisico(c *gin.Context) {
archivo := c.Param("archivo")
pathArchivo := filepath.Join("/opt", "doc_temporales", archivo)
os.Remove(pathArchivo)
c.JSON(http.StatusOK, gin.H{"ok": true, "file": pathArchivo})
}

// GET /archivo/:idorder — lista archivos de MongoDB por order con file_status=1
func ArchivoListByOrderHandler(fu usecase.FileUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
idorder := c.Param("idorder")
files, err := fu.GetByOrderID(c.Request.Context(), idorder)
if err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error cargar seller", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "files": files})
}
}

// POST /archivo/ — crea registro de archivo en MongoDB
func ArchivoCreateHandler(fu usecase.FileUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
var payload domain.File
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al guardar el Archivo", "errors": err.Error()})
return
}
if err := fu.Create(c.Request.Context(), &payload); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al guardar el Archivo", "errors": err.Error()})
return
}
c.JSON(http.StatusCreated, gin.H{"ok": true, "file": payload})
}
}

// PUT /archivo/:id — actualiza registro de archivo en MongoDB
func ArchivoUpdateHandler(fu usecase.FileUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
id := c.Param("id")
var payload domain.File
if err := c.ShouldBindJSON(&payload); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"ok": false, "mensaje": "Error al buscar el archivo", "errors": err.Error()})
return
}
saved, err := fu.Update(c.Request.Context(), id, &payload)
if err != nil {
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "file": saved})
}
}

// DELETE /archivo/:idArchivo — elimina registro de archivo de MongoDB y retorna el borrado
func ArchivoDeleteHandler(fu usecase.FileUsecase) gin.HandlerFunc {
return func(c *gin.Context) {
id := c.Param("idArchivo")
file, _ := fu.GetByID(c.Request.Context(), id)
if err := fu.Delete(c.Request.Context(), id); err != nil {
c.JSON(http.StatusInternalServerError, gin.H{"ok": false, "mensaje": "Error al borrar el Archivo", "errors": err.Error()})
return
}
c.JSON(http.StatusOK, gin.H{"ok": true, "file": file})
}
}
