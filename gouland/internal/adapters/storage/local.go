package storageadapter

import (
	"io"
	"os"
	"path/filepath"
	"io/ioutil"
	"fmt"
)

// LocalStorage guarda archivos en el filesystem local bajo BaseDir
type LocalStorage struct {
	BaseDir string
}

func NewLocalStorage(base string) *LocalStorage {
	return &LocalStorage{BaseDir: base}
}

func (s *LocalStorage) fullPath(rel string) string {
	return filepath.Join(s.BaseDir, rel)
}

func (s *LocalStorage) Save(destination string, src io.Reader) (string, error) {
	fp := s.fullPath(destination)
	dir := filepath.Dir(fp)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("mkdir: %w", err)
	}
	f, err := os.Create(fp)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer f.Close()
	if _, err := io.Copy(f, src); err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}
	return fp, nil
}

func (s *LocalStorage) Open(path string) (io.ReadCloser, error) {
	fp := s.fullPath(path)
	f, err := os.Open(fp)
	if err != nil {
		return nil, err
	}
	return f, nil
}

func (s *LocalStorage) List(prefix string) ([]string, error) {
	root := s.fullPath(prefix)
	files := []string{}
	infos, err := ioutil.ReadDir(root)
	if err != nil {
		return files, err
	}
	for _, info := range infos {
		if !info.IsDir() {
			files = append(files, info.Name())
		}
	}
	return files, nil
}

func (s *LocalStorage) Delete(path string) error {
	fp := s.fullPath(path)
	return os.Remove(fp)
}
