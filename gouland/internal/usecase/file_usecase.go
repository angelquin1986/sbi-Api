package usecase

import (
"context"

"gouland/internal/domain"
"gouland/internal/ports"
"go.mongodb.org/mongo-driver/bson/primitive"
)

type FileUsecase interface {
GetByOrderID(ctx context.Context, orderID string) ([]domain.File, error)
GetByID(ctx context.Context, id string) (*domain.File, error)
Create(ctx context.Context, f *domain.File) error
Update(ctx context.Context, id string, f *domain.File) (*domain.File, error)
Delete(ctx context.Context, id string) error
}

type fileUsecase struct{ repo ports.FileRepo }

func NewFileUsecase(r ports.FileRepo) FileUsecase { return &fileUsecase{repo: r} }

func (u *fileUsecase) GetByOrderID(ctx context.Context, orderID string) ([]domain.File, error) {
oid, _ := primitive.ObjectIDFromHex(orderID)
return u.repo.GetByOrderID(ctx, oid)
}
func (u *fileUsecase) GetByID(ctx context.Context, id string) (*domain.File, error) {
oid, _ := primitive.ObjectIDFromHex(id)
return u.repo.GetByID(ctx, oid)
}
func (u *fileUsecase) Create(ctx context.Context, f *domain.File) error { return u.repo.Create(ctx, f) }
func (u *fileUsecase) Update(ctx context.Context, id string, f *domain.File) (*domain.File, error) {
oid, _ := primitive.ObjectIDFromHex(id)
return u.repo.Update(ctx, oid, f)
}
func (u *fileUsecase) Delete(ctx context.Context, id string) error {
oid, _ := primitive.ObjectIDFromHex(id)
return u.repo.Delete(ctx, oid)
}
