package usecase

import (
	"context"

	"gouland/internal/domain"
	"gouland/internal/ports"
)

type OrderUsecase interface {
	List(ctx context.Context) ([]domain.Order, error)
	Get(ctx context.Context, id string) (*domain.Order, error)
	Create(ctx context.Context, o *domain.Order) error
	Update(ctx context.Context, id string, o *domain.Order) (*domain.Order, error)
	Delete(ctx context.Context, id string) error
}

type orderUsecase struct{ repo ports.OrderRepo }

func NewOrderUsecase(r ports.OrderRepo) OrderUsecase { return &orderUsecase{repo: r} }

func (u *orderUsecase) List(ctx context.Context) ([]domain.Order, error) { return u.repo.GetAll(ctx) }
func (u *orderUsecase) Get(ctx context.Context, id string) (*domain.Order, error) { return u.repo.GetByID(ctx, domain.HexToObjectID(id)) }
func (u *orderUsecase) Create(ctx context.Context, o *domain.Order) error {
	if o.StateOrder == 0 {
		o.StateOrder = 1
	}
	return u.repo.Create(ctx, o)
}
func (u *orderUsecase) Update(ctx context.Context, id string, o *domain.Order) (*domain.Order, error) { return u.repo.Update(ctx, domain.HexToObjectID(id), o) }
func (u *orderUsecase) Delete(ctx context.Context, id string) error { return u.repo.Delete(ctx, domain.HexToObjectID(id)) }