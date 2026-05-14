package mongoadapter

import (
	"context"
	"time"
	"fmt"

	"gouland/internal/domain"
	"gouland/internal/ports"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SellerRepoMongo struct{ m *Mongo }

func NewSellerRepo(m *Mongo) ports.SellerRepo { return &SellerRepoMongo{m:m} }

func (r *SellerRepoMongo) coll() string { return "sellers" }

func (r *SellerRepoMongo) GetAll(ctx context.Context) ([]domain.Seller, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	cur, err := coll.Find(ctx, bson.M{})
	if err != nil { return nil, fmt.Errorf("find sellers: %w", err) }
	defer cur.Close(ctx)
	var out []domain.Seller
	for cur.Next(ctx) { var s domain.Seller; if err := cur.Decode(&s); err != nil { return nil, err }; s.Password = ""; out = append(out, s) }
	return out, nil
}

func (r *SellerRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Seller, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	var s domain.Seller
	if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&s); err != nil { return nil, fmt.Errorf("find seller: %w", err) }
	s.Password = ""
	return &s, nil
}

func (r *SellerRepoMongo) GetByEmail(ctx context.Context, email string) (*domain.Seller, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	var s domain.Seller
	if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"email": email}).Decode(&s); err != nil { return nil, fmt.Errorf("find seller: %w", err) }
	return &s, nil
}

func (r *SellerRepoMongo) Create(ctx context.Context, s *domain.Seller) error {
	s.ID = primitive.NewObjectID()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, s)
	return err
}

func (r *SellerRepoMongo) Update(ctx context.Context, id primitive.ObjectID, s *domain.Seller) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"email": s.Email, "name": s.Name}})
	return err
}

func (r *SellerRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).DeleteOne(ctx, bson.M{"_id": id})
	return err
}
