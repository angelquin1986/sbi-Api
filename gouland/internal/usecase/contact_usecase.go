package usecase

import (
"context"

"gouland/internal/domain"
"gouland/internal/ports"
)

type ContactUsecase interface {
List(ctx context.Context) ([]domain.Contact, error)
Create(ctx context.Context, c *domain.Contact) error
}

type contactUsecase struct{ repo ports.ContactRepo }

func NewContactUsecase(r ports.ContactRepo) ContactUsecase { return &contactUsecase{repo: r} }

func (u *contactUsecase) List(ctx context.Context) ([]domain.Contact, error) { return u.repo.GetAll(ctx) }
func (u *contactUsecase) Create(ctx context.Context, c *domain.Contact) error { return u.repo.Create(ctx, c) }
