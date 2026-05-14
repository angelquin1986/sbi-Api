package usecase

import (
	"context"

	"gouland/internal/domain"
	"gouland/internal/ports"
)

type PassengerUsecase interface {
	List(ctx context.Context) ([]domain.Passenger, error)
	Get(ctx context.Context, id string) (*domain.Passenger, error)
	Create(ctx context.Context, p *domain.Passenger) error
	Update(ctx context.Context, id string, p *domain.Passenger) error
	Delete(ctx context.Context, id string) error
}

type passengerUsecase struct{ repo ports.PassengerRepo }

func NewPassengerUsecase(r ports.PassengerRepo) PassengerUsecase { return &passengerUsecase{repo: r} }

func (u *passengerUsecase) List(ctx context.Context) ([]domain.Passenger, error) { return u.repo.GetAll(ctx) }
func (u *passengerUsecase) Get(ctx context.Context, id string) (*domain.Passenger, error) { return u.repo.GetByID(ctx, domain.HexToObjectID(id)) }
func (u *passengerUsecase) Create(ctx context.Context, p *domain.Passenger) error { return u.repo.Create(ctx, p) }
func (u *passengerUsecase) Update(ctx context.Context, id string, p *domain.Passenger) error { return u.repo.Update(ctx, domain.HexToObjectID(id), p) }
func (u *passengerUsecase) Delete(ctx context.Context, id string) error { return u.repo.Delete(ctx, domain.HexToObjectID(id)) }