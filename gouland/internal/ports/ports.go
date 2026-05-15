package ports

import (
"context"
"time"

"gouland/internal/domain"
"go.mongodb.org/mongo-driver/bson/primitive"
)

type CountryRepo interface {
GetAll(ctx context.Context) ([]domain.Country, error)
GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Country, error)
Create(ctx context.Context, c *domain.Country) error
Update(ctx context.Context, id primitive.ObjectID, c *domain.Country) error
Delete(ctx context.Context, id primitive.ObjectID) error
Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error)
}

type PassengerRepo interface {
GetAll(ctx context.Context) ([]domain.Passenger, error)
GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Passenger, error)
GetByOrderID(ctx context.Context, orderID primitive.ObjectID) ([]domain.Passenger, error)
Create(ctx context.Context, p *domain.Passenger) error
Update(ctx context.Context, id primitive.ObjectID, p *domain.Passenger) (*domain.Passenger, error)
Delete(ctx context.Context, id primitive.ObjectID) error
Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error)
}

type OrderRepo interface {
GetAll(ctx context.Context) ([]domain.Order, error)
GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Order, error)
Create(ctx context.Context, o *domain.Order) error
Update(ctx context.Context, id primitive.ObjectID, o *domain.Order) (*domain.Order, error)
Delete(ctx context.Context, id primitive.ObjectID) error
Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error)
FindFiltered(ctx context.Context, f OrderFilter) ([]domain.Order, error)
AggregateByMonth(ctx context.Context, agentIDs []int) ([]map[string]interface{}, error)
CountByTMDate(ctx context.Context, agentIDs []int) ([]map[string]interface{}, error)
FindWithTMDate(ctx context.Context) ([]domain.Order, error)
}

// OrderFilter represents filter params for complex busqueda
type OrderFilter struct {
AgentIDs    []int
RoleAgente  string
FIni        time.Time
FFin        time.Time
NameContact string
TmCode      string
}

type SellerRepo interface {
GetAll(ctx context.Context) ([]domain.Seller, error)
GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Seller, error)
GetByEmail(ctx context.Context, email string) (*domain.Seller, error)
GetBySellerStringID(ctx context.Context, sellerID string) ([]domain.Seller, error)
GetByNUser(ctx context.Context, nombre string) ([]domain.Seller, error)
GetByCompany(ctx context.Context, company string) ([]domain.Seller, error)
Create(ctx context.Context, s *domain.Seller) error
Update(ctx context.Context, id primitive.ObjectID, s *domain.Seller) error
Delete(ctx context.Context, id primitive.ObjectID) (*domain.Seller, error)
}

type ContactRepo interface {
GetAll(ctx context.Context) ([]domain.Contact, error)
Create(ctx context.Context, c *domain.Contact) error
}

type FileRepo interface {
GetByOrderID(ctx context.Context, orderID primitive.ObjectID) ([]domain.File, error)
GetByID(ctx context.Context, id primitive.ObjectID) (*domain.File, error)
Create(ctx context.Context, f *domain.File) error
Update(ctx context.Context, id primitive.ObjectID, f *domain.File) (*domain.File, error)
Delete(ctx context.Context, id primitive.ObjectID) error
}
