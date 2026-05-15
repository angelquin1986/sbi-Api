package usecase

import (
"context"
"fmt"

"gouland/internal/auth"
"gouland/internal/domain"
"gouland/internal/ports"
)

type SellerUsecase interface {
Authenticate(ctx context.Context, email, password string) (string, *domain.Seller, error)
Create(ctx context.Context, s *domain.Seller) error
GetAll(ctx context.Context) ([]domain.Seller, error)
GetByID(ctx context.Context, id string) (*domain.Seller, error)
GetByEmail(ctx context.Context, email string) (*domain.Seller, error)
GetBySellerStringID(ctx context.Context, sellerID string) ([]domain.Seller, error)
GetByNUser(ctx context.Context, nombre string) ([]domain.Seller, error)
GetByCompany(ctx context.Context, company string) ([]domain.Seller, error)
Update(ctx context.Context, id string, s *domain.Seller) error
Delete(ctx context.Context, id string) (*domain.Seller, error)
}

type sellerUsecase struct{ repo ports.SellerRepo }

func NewSellerUsecase(r ports.SellerRepo) SellerUsecase { return &sellerUsecase{repo: r} }

func (u *sellerUsecase) Authenticate(ctx context.Context, email, password string) (string, *domain.Seller, error) {
s, err := u.repo.GetByEmail(ctx, email)
if err != nil || s == nil {
return "", nil, fmt.Errorf("invalid credentials")
}
if err := auth.CheckPassword(s.Password, password); err != nil {
return "", nil, fmt.Errorf("invalid credentials")
}
tok, err := auth.GenerateToken(s.ID.Hex())
if err != nil {
return "", nil, fmt.Errorf("token: %w", err)
}
s.Password = ""
return tok, s, nil
}

func (u *sellerUsecase) Create(ctx context.Context, s *domain.Seller) error {
if s.Password != "" {
hash, err := auth.HashPassword(s.Password)
if err != nil {
return fmt.Errorf("hash: %w", err)
}
s.Password = hash
}
return u.repo.Create(ctx, s)
}

func (u *sellerUsecase) GetAll(ctx context.Context) ([]domain.Seller, error) {
return u.repo.GetAll(ctx)
}
func (u *sellerUsecase) GetByID(ctx context.Context, id string) (*domain.Seller, error) {
return u.repo.GetByID(ctx, domain.HexToObjectID(id))
}
func (u *sellerUsecase) GetByEmail(ctx context.Context, email string) (*domain.Seller, error) {
return u.repo.GetByEmail(ctx, email)
}
func (u *sellerUsecase) GetByNUser(ctx context.Context, nombre string) ([]domain.Seller, error) {
return u.repo.GetByNUser(ctx, nombre)
}
func (u *sellerUsecase) GetByCompany(ctx context.Context, company string) ([]domain.Seller, error) {
return u.repo.GetByCompany(ctx, company)
}
func (u *sellerUsecase) Update(ctx context.Context, id string, s *domain.Seller) error {
return u.repo.Update(ctx, domain.HexToObjectID(id), s)
}
func (u *sellerUsecase) GetBySellerStringID(ctx context.Context, sellerID string) ([]domain.Seller, error) {
return u.repo.GetBySellerStringID(ctx, sellerID)
}
func (u *sellerUsecase) Delete(ctx context.Context, id string) (*domain.Seller, error) {
return u.repo.Delete(ctx, domain.HexToObjectID(id))
}
