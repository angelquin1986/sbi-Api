package mongoadapter

import (
"context"
"fmt"
"time"

"gouland/internal/domain"
"gouland/internal/ports"

"go.mongodb.org/mongo-driver/bson"
"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PassengerRepoMongo struct{ m *Mongo }

func NewPassengerRepo(m *Mongo) ports.PassengerRepo { return &PassengerRepoMongo{m: m} }

func (r *PassengerRepoMongo) coll() string { return "passengers" }

func (r *PassengerRepoMongo) GetAll(ctx context.Context) ([]domain.Passenger, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{})
if err != nil {
return nil, fmt.Errorf("find pax: %w", err)
}
defer cur.Close(ctx)
var out []domain.Passenger
for cur.Next(ctx) {
var p domain.Passenger
if err := cur.Decode(&p); err != nil {
return nil, err
}
out = append(out, p)
}
return out, nil
}

func (r *PassengerRepoMongo) GetByID(ctx context.Context, id primitive.ObjectID) (*domain.Passenger, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
var p domain.Passenger
if err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOne(ctx, bson.M{"_id": id}).Decode(&p); err != nil {
return nil, fmt.Errorf("find pax by id: %w", err)
}
return &p, nil
}

func (r *PassengerRepoMongo) GetByOrderID(ctx context.Context, orderID primitive.ObjectID) ([]domain.Passenger, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
cur, err := r.m.Client.Database("bookingDB").Collection(r.coll()).Find(ctx, bson.M{"pax_id_order": orderID})
if err != nil {
return nil, fmt.Errorf("find pax by order: %w", err)
}
defer cur.Close(ctx)
var out []domain.Passenger
for cur.Next(ctx) {
var p domain.Passenger
if err := cur.Decode(&p); err != nil {
return nil, err
}
out = append(out, p)
}
return out, nil
}

func (r *PassengerRepoMongo) Create(ctx context.Context, p *domain.Passenger) error {
p.ID = primitive.NewObjectID()
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).InsertOne(ctx, p)
return err
}

func (r *PassengerRepoMongo) Update(ctx context.Context, id primitive.ObjectID, p *domain.Passenger) (*domain.Passenger, error) {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
update := bson.M{"$set": bson.M{
"pax_title": p.PaxTitle, "pax_first_name": p.PaxFirstName, "pax_last_name": p.PaxLastName,
"pax_nationality": p.PaxNationality, "pax_date_month": p.PaxDateMonth, "pax_date_day": p.PaxDateDay,
"pax_date_year": p.PaxDateYear, "pax_passport": p.PaxPassport,
"pax_passport_exp_month": p.PaxPassportExpMonth, "pax_passport_exp_day": p.PaxPassportExpDay,
"pax_passport_exp_year": p.PaxPassportExpYear, "pax_emergency_contact": p.PaxEmergencyContact,
"pax_insurance_company": p.PaxInsuranceCompany, "pax_insurance_number": p.PaxInsuranceNumber,
"pax_contact_hotel": p.PaxContactHotel, "pax_restrictions": p.PaxRestrictions,
"pax_marital_status": p.PaxMaritalStatus, "pax_arrival_date": p.PaxArrivalDate,
"pax_arrival_flight": p.PaxArrivalFlight, "pax_departure_date": p.PaxDepartureDate,
"pax_departure_flight": p.PaxDepartureFlight, "pax_type_acomm": p.PaxTypeAcomm,
"pax_us_shoe_size": p.PaxUsShoeSize, "pax_hotel_contact": p.PaxHotelContact,
"data_encrypt": p.DataEncrypt, "key_encrypt": p.KeyEncrypt,
}}
opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
var result domain.Passenger
err := r.m.Client.Database("bookingDB").Collection(r.coll()).FindOneAndUpdate(ctx, bson.M{"_id": id}, update, opts).Decode(&result)
if err != nil {
return nil, err
}
return &result, nil
}

func (r *PassengerRepoMongo) Delete(ctx context.Context, id primitive.ObjectID) error {
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()
_, err := r.m.Client.Database("bookingDB").Collection(r.coll()).DeleteOne(ctx, bson.M{"_id": id})
return err
}

func (r *PassengerRepoMongo) Search(ctx context.Context, field string, pattern string) ([]map[string]interface{}, error) {
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
