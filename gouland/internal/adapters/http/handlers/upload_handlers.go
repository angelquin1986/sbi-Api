package handlers

import (
"io"
"net/http"
"os"
"path/filepath"
"strings"

"github.com/gin-gonic/gin"
)

func UploadGetHandler(c *gin.Context) {
c.String(http.StatusOK, "file received")
}

func UploadHandler(c *gin.Context) {
file, header, err := c.Request.FormFile("temporales")
if err != nil {
c.JSON(http.StatusOK, gin.H{"success": false})
return
}
defer file.Close()

os.MkdirAll("/opt/doc_temporales", 0755)
os.MkdirAll("/opt/doc_almacenados", 0755)

fname := header.Filename
var outPath string
if strings.Contains(strings.ToLower(fname), "file") {
outPath = filepath.Join("/opt/doc_almacenados", fname)
} else {
outPath = filepath.Join("/opt/doc_temporales", fname)
}

out, err := os.Create(outPath)
if err != nil {
c.JSON(http.StatusOK, gin.H{"success": false})
return
}
defer out.Close()
if _, err := io.Copy(out, file); err != nil {
c.JSON(http.StatusOK, gin.H{"success": false})
return
}
c.JSON(http.StatusOK, gin.H{"success": true})
}
