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

type ContactRepoMongo struct{ m *Mongo }

func NewContactRepo(m *Mongo) ports.ContactRepo { return &ContactRepoMongo{m: m} }

func (r *ContactRepoMongo) coll() string { return "contacts" }

func (r *ContactRepoMongo) GetAll(ctx context.Context) ([]domain.Contact, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{})
if err != nil {
return nil, fmt.Errorf("find contacts: %w", err)
}
defer cur.Close(ctx)
var out []domain.Contact
for cur.Next(ctx) {
var ct domain.Contact
if err := cur.Decode(&ct); err != nil {
return nil, err
}
out = append(out, ct)
}
return out, nil
}

func (r *ContactRepoMongo) Create(ctx context.Context, c *domain.Contact) error {
c.ID = primitive.NewObjectID()
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, c)
return err
}
