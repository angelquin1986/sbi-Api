package mongoadapter

import (
"context"
"fmt"
"time"

"gouland/internal/domain"
"gouland/internal/ports"

"go.mongodb.org/mongo-driver/bson"
"go.mongodb.org/mongo-driver/bson/primitive"
)

type SellerRepoMongo struct{ m *Mongo }

func NewSellerRepo(m *Mongo) ports.SellerRepo { return &SellerRepoMongo{m: m} }

func (r *SellerRepoMongo) coll() string { return "sellers" }

func (r *SellerRepoMongo) GetAll(ctx context.Context) ([]domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{})
if err != nil {
return nil, fmt.Errorf("find sellers: %w", err)
}
defer cur.Close(ctx)
var out []domain.Seller
for cur.Next(ctx) {
var s domain.Seller
if err := cur.Decode(&s); err != nil {
return nil, err
}
s.Password = ""
out = append(out, s)
}
return out, nil
}

func (r *SellerRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
var s domain.Seller
if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&s); err != nil {
return nil, fmt.Errorf("find seller: %w", err)
}
s.Password = ""
return &s, nil
}

func (r *SellerRepoMongo) GetByEmail(ctx context.Context, email string) (*domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
var s domain.Seller
// mailseller es el campo en Mongo (igual que en el modelo Node.js)
if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"mailseller": email}).Decode(&s); err != nil {
return nil, fmt.Errorf("find seller by email: %w", err)
}
return &s, nil
}

func (r *SellerRepoMongo) GetByNUser(ctx context.Context, nombre string) ([]domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{"nuser": nombre})
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []domain.Seller
for cur.Next(ctx) {
var s domain.Seller
if err := cur.Decode(&s); err == nil {
s.Password = ""
out = append(out, s)
}
}
return out, nil
}

func (r *SellerRepoMongo) GetByCompany(ctx context.Context, company string) ([]domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{"company": company})
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []domain.Seller
for cur.Next(ctx) {
var s domain.Seller
if err := cur.Decode(&s); err == nil {
s.Password = ""
out = append(out, s)
}
}
return out, nil
}

func (r *SellerRepoMongo) Create(ctx context.Context, s *domain.Seller) error {
s.ID = primitive.NewObjectID()
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, s)
return err
}

func (r *SellerRepoMongo) Update(ctx context.Context, id primitive.ObjectID, s *domain.Seller) error {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).UpdateOne(ctx, bson.M{"_id": id},
bson.M{"$set": bson.M{
"nseller":    s.NSeller,
"mailseller": s.MailSeller,
"role":       s.Role,
"id":         s.SellerID,
}})
return err
}

func (r *SellerRepoMongo) GetBySellerStringID(ctx context.Context, sellerID string) ([]domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{"id": sellerID})
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []domain.Seller
for cur.Next(ctx) {
var s domain.Seller
if err := cur.Decode(&s); err == nil {
s.Password = ""
out = append(out, s)
}
}
return out, nil
}

func (r *SellerRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) (*domain.Seller, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
var s domain.Seller
err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOneAndDelete(ctx, bson.M{"_id": id}).Decode(&s)
if err != nil {
return nil, err
}
s.Password = ""
return &s, nil
}
