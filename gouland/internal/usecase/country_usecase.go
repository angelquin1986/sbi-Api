package usecase

import (
	"context"

	"gouland/internal/domain"
	"gouland/internal/ports"
)

type CountryUsecase interface {
	List(ctx context.Context) ([]domain.Country, error)
	Get(ctx context.Context, id string) (*domain.Country, error)
	Create(ctx context.Context, c *domain.Country) error
	Update(ctx context.Context, id string, c *domain.Country) error
	Delete(ctx context.Context, id string) error
}

type countryUsecase struct{ repo ports.CountryRepo }

func NewCountryUsecase(r ports.CountryRepo) CountryUsecase { return &countryUsecase{repo: r} }

func (u *countryUsecase) List(ctx context.Context) ([]domain.Country, error) { return u.repo.GetAll(ctx) }
func (u *countryUsecase) Get(ctx context.Context, id string) (*domain.Country, error) { return u.repo.GetByID(ctx, domain.HexToObjectID(id)) }
func (u *countryUsecase) Create(ctx context.Context, c *domain.Country) error { return u.repo.Create(ctx, c) }
func (u *countryUsecase) Update(ctx context.Context, id string, c *domain.Country) error { return u.repo.Update(ctx, domain.HexToObjectID(id), c) }
func (u *countryUsecase) Delete(ctx context.Context, id string) error { return u.repo.Delete(ctx, domain.HexToObjectID(id)) }