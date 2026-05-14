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

type OrderRepoMongo struct{ m *Mongo }

func NewOrderRepo(m *Mongo) ports.OrderRepo { return &OrderRepoMongo{m:m} }

func (r *OrderRepoMongo) coll() string { return "order" }

func (r *OrderRepoMongo) GetAll(ctx context.Context) ([]domain.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	cur, err := coll.Find(ctx, bson.M{})
	if err != nil { return nil, fmt.Errorf("find orders: %w", err) }
	defer cur.Close(ctx)
	var out []domain.Order
	for cur.Next(ctx) { var o domain.Order; if err := cur.Decode(&o); err != nil { return nil, err }; out = append(out, o) }
	return out, nil
}

func (r *OrderRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	var o domain.Order
	if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&o); err != nil { return nil, fmt.Errorf("find order: %w", err) }
	return &o, nil
}

func (r *OrderRepoMongo) Create(ctx context.Context, o *domain.Order) error {
	o.ID = primitive.NewObjectID()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, o)
	return err
}

func (r *OrderRepoMongo) Update(ctx context.Context, id primitive.ObjectID, o *domain.Order) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"reference": o.Reference, "status": o.Status}})
	return err
}

func (r *OrderRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *OrderRepoMongo) Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	filter := bson.M{field: bson.M{"$regex": primitive.Regex{Pattern: pattern, Options: "i"}}}
	cur, err := coll.Find(ctx, filter)
	if err != nil { return nil, err }
	defer cur.Close(ctx)
	var out []map[string]interface{}
	for cur.Next(ctx) { var m map[string]interface{}; if err := cur.Decode(&m); err == nil { out = append(out, m) } }
	return out, nil
}
