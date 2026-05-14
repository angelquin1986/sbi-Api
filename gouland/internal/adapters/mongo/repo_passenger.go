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

type PassengerRepoMongo struct{ m *Mongo }

func NewPassengerRepo(m *Mongo) ports.PassengerRepo { return &PassengerRepoMongo{m:m} }

func (r *PassengerRepoMongo) coll() string { return "passenger" }

func (r *PassengerRepoMongo) GetAll(ctx context.Context) ([]domain.Passenger, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	cur, err := coll.Find(ctx, bson.M{})
	if err != nil { return nil, fmt.Errorf("find pax: %w", err) }
	defer cur.Close(ctx)
	var out []domain.Passenger
	for cur.Next(ctx) { var p domain.Passenger; if err := cur.Decode(&p); err != nil { return nil, err }; out = append(out, p) }
	return out, nil
}

func (r *PassengerRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Passenger, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	var p domain.Passenger
	if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&p); err != nil { return nil, fmt.Errorf("find pax: %w", err) }
	return &p, nil
}

func (r *PassengerRepoMongo) Create(ctx context.Context, p *domain.Passenger) error {
	p.ID = primitive.NewObjectID()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, p)
	return err
}

func (r *PassengerRepoMongo) Update(ctx context.Context, id primitive.ObjectID, p *domain.Passenger) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"name": p.Name, "document": p.Document, "age": p.Age}})
	return err
}

func (r *PassengerRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second); defer cancel()
	_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).DeleteOne(ctx, bson.M{"_id": id})
	return err
}

// Search executes a regex search on a given field and returns raw documents
func (r *PassengerRepoMongo) Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error) {
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