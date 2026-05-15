package mongoadapter

import (
"context"
"fmt"
"time"

"gouland/internal/domain"
"gouland/internal/ports"

"go.mongodb.org/mongo-driver/bson"
"go.mongodb.org/mongo-driver/bson/primitive"
"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OrderRepoMongo struct{ m *Mongo }

func NewOrderRepo(m *Mongo) ports.OrderRepo { return &OrderRepoMongo{m: m} }

func (r *OrderRepoMongo) coll() string { return "orders" }

func (r *OrderRepoMongo) GetAll(ctx context.Context) ([]domain.Order, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{})
if err != nil {
return nil, fmt.Errorf("find orders: %w", err)
}
defer cur.Close(ctx)
var out []domain.Order
for cur.Next(ctx) {
var o domain.Order
if err := cur.Decode(&o); err != nil {
return nil, err
}
out = append(out, o)
}
return out, nil
}

func (r *OrderRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Order, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
var o domain.Order
if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&o); err != nil {
return nil, fmt.Errorf("find order: %w", err)
}
return &o, nil
}

func (r *OrderRepoMongo) Create(ctx context.Context, o *domain.Order) error {
o.ID = primitive.NewObjectID()
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, o)
return err
}

func (r *OrderRepoMongo) Update(ctx context.Context, id primitive.ObjectID, o *domain.Order) (*domain.Order, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
update := bson.M{"$set": bson.M{
"contact_person_name": o.ContactPersonName,
"contact_person_mail": o.ContactPersonMail,
"number_pax":          o.NumberPax,
"billing_country":     o.BillingCountry,
"billing_phone":       o.BillingPhone,
"billing_address":     o.BillingAddress,
"billing_city":        o.BillingCity,
"tm_code":             o.TmCode,
"tm_date_cruise":      o.TmDateCruise,
}}
opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
var result domain.Order
err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOneAndUpdate(ctx, bson.M{"_id": id}, update, opts).Decode(&result)
if err != nil {
return nil, err
}
return &result, nil
}

func (r *OrderRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).DeleteOne(ctx, bson.M{"_id": id})
return err
}

func (r *OrderRepoMongo) Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
filter := bson.M{field: bson.M{"$regex": primitive.Regex{Pattern: pattern, Options: "i"}}}
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, filter)
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []map[string]interface{}
for cur.Next(ctx) {
var m map[string]interface{}
if err := cur.Decode(&m); err == nil {
out = append(out, m)
}
}
return out, nil
}

func (r *OrderRepoMongo) FindFiltered(ctx context.Context, f ports.OrderFilter) ([]domain.Order, error) {
ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
defer cancel()

andFilters := bson.A{
bson.M{"state_order": 1},
bson.M{"date_submited": bson.M{"$gte": f.FIni, "$lte": f.FFin}},
}

if f.RoleAgente != "OPERACION_ROLE" {
if len(f.AgentIDs) > 0 {
andFilters = append(andFilters, bson.M{"sales_agent_id": f.AgentIDs[0]})
}
} else {
andFilters = append(andFilters, bson.M{"sales_agent_id": bson.M{"$in": f.AgentIDs}})
}
if f.NameContact != "" && f.NameContact != "0" {
andFilters = append(andFilters, bson.M{"contact_person_name": bson.M{"$regex": primitive.Regex{Pattern: ".*" + f.NameContact, Options: "i"}}})
}
if f.TmCode != "" && f.TmCode != "-" {
andFilters = append(andFilters, bson.M{"tm_code": f.TmCode})
}

cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{"$and": andFilters})
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []domain.Order
for cur.Next(ctx) {
var o domain.Order
if err := cur.Decode(&o); err == nil {
out = append(out, o)
}
}
return out, nil
}

func (r *OrderRepoMongo) AggregateByMonth(ctx context.Context, agentIDs []int) ([]map[string]interface{}, error) {
ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
defer cancel()
pipeline := mongo.Pipeline{
{{Key: "$match", Value: bson.M{"sales_agent_id": bson.M{"$in": agentIDs}}}},
{{Key: "$group", Value: bson.M{
"_id":  bson.M{"$dateToString": bson.M{"format": "%m %Y", "date": "$date_submited"}},
"cant": bson.M{"$sum": 1},
}}},
}
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Aggregate(ctx, pipeline)
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []map[string]interface{}
for cur.Next(ctx) {
var m map[string]interface{}
if err := cur.Decode(&m); err == nil {
out = append(out, m)
}
}
return out, nil
}

func (r *OrderRepoMongo) CountByTMDate(ctx context.Context, agentIDs []int) ([]map[string]interface{}, error) {
ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
defer cancel()
pipeline := mongo.Pipeline{
{{Key: "$match", Value: bson.M{"sales_agent_id": bson.M{"$in": agentIDs}}}},
{{Key: "$project", Value: bson.M{
"tm_date": bson.M{"$cond": bson.A{
bson.M{"$or": bson.A{
bson.M{"$eq": bson.A{"$tm_date_cruise", nil}},
bson.M{"$eq": bson.A{"$tm_date_cruise", ""}},
bson.M{"$not": bson.A{"$tm_date_cruise"}},
}},
"Incomplete", "Complete",
}},
}}},
{{Key: "$group", Value: bson.M{"_id": "$tm_date", "cant": bson.M{"$sum": 1}}}},
}
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Aggregate(ctx, pipeline)
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []map[string]interface{}
for cur.Next(ctx) {
var m map[string]interface{}
if err := cur.Decode(&m); err == nil {
out = append(out, m)
}
}
return out, nil
}

func (r *OrderRepoMongo) FindWithTMDate(ctx context.Context) ([]domain.Order, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
filter := bson.M{"$and": bson.A{
bson.M{"tm_date_cruise": bson.M{"$exists": true}},
bson.M{"tm_date_cruise": bson.M{"$ne": ""}},
bson.M{"tm_date_cruise": bson.M{"$ne": nil}},
}}
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, filter)
if err != nil {
return nil, err
}
defer cur.Close(ctx)
var out []domain.Order
for cur.Next(ctx) {
var o domain.Order
if err := cur.Decode(&o); err == nil {
out = append(out, o)
}
}
return out, nil
}
