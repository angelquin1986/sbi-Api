package ports

import "io"

// Storage define la abstracción para persistencia de archivos (adapter infra)
type Storage interface {
	// Save escribe contenido desde src en destination relativo y devuelve la ruta completa
	Save(destination string, src io.Reader) (string, error)
	// Open abre un archivo para lectura
	Open(path string) (io.ReadCloser, error)
	// List lista los nombres de archivos en un prefijo/directorio
	List(prefix string) ([]string, error)
	// Delete elimina un archivo
	Delete(path string) error
}
