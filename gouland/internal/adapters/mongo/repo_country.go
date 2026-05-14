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

// CountryRepoMongo implementa ports.CountryRepo
type CountryRepoMongo struct {
	m *Mongo
}

func NewCountryRepo(m *Mongo) ports.CountryRepo {
	return &CountryRepoMongo{m: m}
}

func (r *CountryRepoMongo) coll() string { return "country" }

func (r *CountryRepoMongo) GetAll(ctx context.Context) ([]domain.Country, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	cur, err := coll.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("find countries: %w", err)
	}
	defer cur.Close(ctx)
	var out []domain.Country
	for cur.Next(ctx) {
		var c domain.Country
		if err := cur.Decode(&c); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, nil
}

func (r *CountryRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Country, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	var c domain.Country
	if err := coll.FindOne(ctx, bson.M{"_id": id}).Decode(&c); err != nil {
		return nil, fmt.Errorf("find country by id: %w", err)
	}
	return &c, nil
}

func (r *CountryRepoMongo) Create(ctx context.Context, c *domain.Country) error {
	c.CreatedAt = time.Now().Unix()
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	res, err := coll.InsertOne(ctx, c)
	if err != nil {
		return fmt.Errorf("insert country: %w", err)
	}
	if oid, ok := res.InsertedID.(primitive.ObjectID); ok {
		c.ID = oid
	}
	return nil
}

func (r *CountryRepoMongo) Update(ctx context.Context, id primitive.ObjectID, c *domain.Country) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	_, err := coll.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"code": c.Code, "name": c.Name, "iso": c.ISO}})
	if err != nil {
		return fmt.Errorf("update country: %w", err)
	}
	return nil
}

func (r *CountryRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	coll := r.m.Client.Database("bookingDB").Collection(r.coll())
	_, err := coll.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return fmt.Errorf("delete country: %w", err)
	}
	return nil
}

// Search executes a regex search on a given field and returns raw documents
func (r *CountryRepoMongo) Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error) {
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
