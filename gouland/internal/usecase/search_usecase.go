package usecase

import (
	"context"

	"gouland/internal/ports"
)

// SearchUsecase orchestrates search across multiple repos
type SearchUsecase interface {
	SearchAll(ctx context.Context, q string) (map[string]interface{}, error)
}

type searchUsecase struct{
	order ports.OrderRepo
	pax ports.PassengerRepo
	country ports.CountryRepo
}

func NewSearchUsecase(or ports.OrderRepo, pr ports.PassengerRepo, cr ports.CountryRepo) SearchUsecase {
	return &searchUsecase{order: or, pax: pr, country: cr}
}

func (s *searchUsecase) SearchAll(ctx context.Context, q string) (map[string]interface{}, error) {
	res := make(map[string]interface{})
	if o, err := s.order.Search(ctx, "reference", q); err == nil { res["order"] = o } else { res["order"] = []interface{}{} }
	if p, err := s.pax.Search(ctx, "name", q); err == nil { res["passenger"] = p } else { res["passenger"] = []interface{}{} }
	if c, err := s.country.Search(ctx, "name", q); err == nil { res["country"] = c } else { res["country"] = []interface{}{} }
	return res, nil
}