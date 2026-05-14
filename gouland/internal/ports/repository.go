package ports

import (
	"context"
	"gouland/internal/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CountryRepo defines operations for country entities
type CountryRepo interface {
	GetAll(ctx context.Context) ([]domain.Country, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Country, error)
	Create(ctx context.Context, c *domain.Country) error
	Update(ctx context.Context, id primitive.ObjectID, c *domain.Country) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error)
}

// PassengerRepo defines operations for passengers
type PassengerRepo interface {
	GetAll(ctx context.Context) ([]domain.Passenger, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Passenger, error)
	Create(ctx context.Context, p *domain.Passenger) error
	Update(ctx context.Context, id primitive.ObjectID, p *domain.Passenger) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error)
}

// OrderRepo defines operations for orders
type OrderRepo interface {
	GetAll(ctx context.Context) ([]domain.Order, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Order, error)
	Create(ctx context.Context, o *domain.Order) error
	Update(ctx context.Context, id primitive.ObjectID, o *domain.Order) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error)
}

// SellerRepo (usuario) defines operations for users/sellers
type SellerRepo interface {
	GetAll(ctx context.Context) ([]domain.Seller, error)
	GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Seller, error)
	GetByEmail(ctx context.Context, email string) (*domain.Seller, error)
	Create(ctx context.Context, s *domain.Seller) error
	Update(ctx context.Context, id primitive.ObjectID, s *domain.Seller) error
	Delete(ctx context.Context, id primitive.ObjectID) error
}

// Contact and File repos can be added similarly when needed
