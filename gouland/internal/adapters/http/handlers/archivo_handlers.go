package handlers

import (
"net/http"
"os"
"path/filepath"
"io"
"strings"

"github.com/gin-gonic/gin"
)

// ArchivoListHandler - lista archivos en /opt/doc_temporales
func ArchivoListHandler(c *gin.Context) {
dir := "/opt/doc_temporales"
files := []string{}
f, err := os.Open(dir)
if err == nil {
defer f.Close()
infos, _ := f.Readdir(-1)
for _, info := range infos {
if !info.IsDir() { files = append(files, info.Name()) }
}
}
c.JSON(http.StatusOK, gin.H{"ok": true, "files": files})
}

// ArchivoDownloadHandler mirrors original: /archivo/file/:carpeta/:archivo behavior
func ArchivoDownloadHandler(c *gin.Context) {
carpeta := c.Param("carpeta")
name := c.Param("name")
base := "/opt"
pathFile := filepath.Join(base, carpeta, name)
ext := strings.ToLower(filepath.Ext(name))
if len(ext) > 0 { ext = ext[1:] }

if ext == "jpg" || ext == "png" || ext == "jpeg" {
c.File(pathFile)
return
}
if ext == "doc" || ext == "docx" {
icon := filepath.Join("/app/opciones", "word.ico")
if _, err := os.Stat(icon); err == nil {
c.File(icon)
return
}
}
if ext == "pdf" {
icon := filepath.Join("/app/opciones", "pdf.png")
if _, err := os.Stat(icon); err == nil {
c.File(icon)
return
}
}
// fallback
icon := filepath.Join("/app/opciones", "file.png")
if _, err := os.Stat(icon); err == nil {
c.File(icon)
return
}
// if nothing found, try to send file or 404
if _, err := os.Stat(pathFile); err == nil {
c.File(pathFile)
return
}
c.JSON(http.StatusNotFound, gin.H{"ok": false, "error": "not found"})
}

// ArchivoDownload by route /archivo/:name uses ArchivoDownloadHandler with carpeta param omitted
func ArchivoDownloadByName(c *gin.Context) {
ArchivoDownloadHandler(c)
}
