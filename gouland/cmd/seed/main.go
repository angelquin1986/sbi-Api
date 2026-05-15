package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ── helpers ──────────────────────────────────────────────────────────────────

func uri() string {
	if v := os.Getenv("MONGODB_URI"); v != "" {
		return v
	}
	return "mongodb://localhost:27017/bookingDB"
}

func connect(ctx context.Context) (*mongo.Database, func()) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri()))
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("ping: %v", err)
	}
	db := client.Database("bookingDB")
	return db, func() { client.Disconnect(ctx) }
}

func isEmpty(ctx context.Context, coll *mongo.Collection) bool {
	n, _ := coll.CountDocuments(ctx, bson.M{})
	return n == 0
}

func must(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %v", msg, err)
	}
}

// ── seed functions ────────────────────────────────────────────────────────────

func seedCountries(ctx context.Context, db *mongo.Database) {
	coll := db.Collection("countries")
	if !isEmpty(ctx, coll) {
		fmt.Println("  [skip] countries — ya tiene datos")
		return
	}
	countries := []interface{}{
		bson.M{"_id": primitive.NewObjectID(), "name": "Ecuador", "code": "EC"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Peru", "code": "PE"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Colombia", "code": "CO"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Chile", "code": "CL"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Argentina", "code": "AR"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Bolivia", "code": "BO"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Brazil", "code": "BR"},
		bson.M{"_id": primitive.NewObjectID(), "name": "United States", "code": "US"},
		bson.M{"_id": primitive.NewObjectID(), "name": "United Kingdom", "code": "GB"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Germany", "code": "DE"},
		bson.M{"_id": primitive.NewObjectID(), "name": "France", "code": "FR"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Spain", "code": "ES"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Italy", "code": "IT"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Canada", "code": "CA"},
		bson.M{"_id": primitive.NewObjectID(), "name": "Australia", "code": "AU"},
	}
	_, err := coll.InsertMany(ctx, countries)
	must(err, "seed countries")
	fmt.Printf("  [ok] countries — %d países insertados\n", len(countries))
}

func seedSellers(ctx context.Context, db *mongo.Database) []primitive.ObjectID {
	coll := db.Collection("sellers")
	if !isEmpty(ctx, coll) {
		fmt.Println("  [skip] sellers — ya tiene datos")
		// return existing ids
		cur, _ := coll.Find(ctx, bson.M{})
		var ids []primitive.ObjectID
		for cur.Next(ctx) {
			var s bson.M
			cur.Decode(&s)
			if id, ok := s["_id"].(primitive.ObjectID); ok {
				ids = append(ids, id)
			}
		}
		return ids
	}
	sellers := []interface{}{
		bson.M{
			"_id":       primitive.NewObjectID(),
			"nseller":   "Carlos Operaciones",
			"mailseller": "operaciones@sbi.com",
			"role":      "OPERADOR_ROLE",
			"id":        "AG001",
			"company":   "Experience Southamerica",
			"nuser":     "coperaciones",
			"password":  "$2a$10$dummyhashforseeddataonly1234567",
		},
		bson.M{
			"_id":       primitive.NewObjectID(),
			"nseller":   "Ana Agente",
			"mailseller": "ana.agente@sbi.com",
			"role":      "AGENTE_ROLE",
			"id":        "AG002",
			"company":   "Experience Southamerica",
			"nuser":     "aagente",
			"password":  "$2a$10$dummyhashforseeddataonly1234567",
		},
		bson.M{
			"_id":       primitive.NewObjectID(),
			"nseller":   "Luis Vendedor",
			"mailseller": "luis.vendedor@sbi.com",
			"role":      "AGENTE_ROLE",
			"id":        "AG003",
			"company":   "Experience Southamerica",
			"nuser":     "lvendedor",
			"password":  "$2a$10$dummyhashforseeddataonly1234567",
		},
	}
	res, err := coll.InsertMany(ctx, sellers)
	must(err, "seed sellers")
	fmt.Printf("  [ok] sellers — %d vendedores insertados\n", len(res.InsertedIDs))
	var ids []primitive.ObjectID
	for _, raw := range sellers {
		if m, ok := raw.(bson.M); ok {
			if id, ok := m["_id"].(primitive.ObjectID); ok {
				ids = append(ids, id)
			}
		}
	}
	return ids
}

func seedContacts(ctx context.Context, db *mongo.Database) {
	coll := db.Collection("contacts")
	if !isEmpty(ctx, coll) {
		fmt.Println("  [skip] contacts — ya tiene datos")
		return
	}
	contacts := []interface{}{
		bson.M{"_id": primitive.NewObjectID(), "nombre": "Hotel Galápagos Dreams", "cargo": "Reservas"},
		bson.M{"_id": primitive.NewObjectID(), "nombre": "Machu Picchu Lodge", "cargo": "Coordinación"},
		bson.M{"_id": primitive.NewObjectID(), "nombre": "Amazon River Camp", "cargo": "Tours"},
		bson.M{"_id": primitive.NewObjectID(), "nombre": "Andes Adventure Co.", "cargo": "Operaciones"},
	}
	_, err := coll.InsertMany(ctx, contacts)
	must(err, "seed contacts")
	fmt.Printf("  [ok] contacts — %d contactos insertados\n", len(contacts))
}

func seedOrdersAndPassengers(ctx context.Context, db *mongo.Database) {
	orderColl := db.Collection("orders")
	paxColl := db.Collection("passengers")
	fileColl := db.Collection("files")

	if !isEmpty(ctx, orderColl) {
		fmt.Println("  [skip] orders — ya tiene datos")
		return
	}

	now := time.Now()
	agentIDs := []int{2, 3} // AG002, AG003 numeric IDs

	type orderSeed struct {
		id            primitive.ObjectID
		contactName   string
		contactMail   string
		billingCountry string
		billingCity   string
		tmCode        string
		agentID       int
	}

	orders := []orderSeed{
		{primitive.NewObjectID(), "John Smith", "john.smith@email.com", "US", "New York", "GAL-2024-001", agentIDs[0]},
		{primitive.NewObjectID(), "Marie Dupont", "marie.dupont@email.fr", "FR", "Paris", "GAL-2024-002", agentIDs[0]},
		{primitive.NewObjectID(), "Hans Mueller", "hans@email.de", "DE", "Berlin", "GAL-2024-003", agentIDs[1]},
		{primitive.NewObjectID(), "Sarah Connor", "sarah.c@email.com", "GB", "London", "GAL-2024-004", agentIDs[1]},
		{primitive.NewObjectID(), "Luigi Rossi", "luigi.r@email.it", "IT", "Rome", "GAL-2024-005", agentIDs[0]},
	}

	var orderDocs []interface{}
	for i, o := range orders {
		orderDocs = append(orderDocs, bson.M{
			"_id":                 o.id,
			"date_submited":       now.AddDate(0, -i, 0),
			"contact_person_name": o.contactName,
			"contact_person_mail": o.contactMail,
			"sales_agent_id":      o.agentID,
			"number_pax":          2,
			"billing_country":     o.billingCountry,
			"billing_phone":       fmt.Sprintf("+1555%04d", i+1000),
			"billing_address":     fmt.Sprintf("%d Main St", (i+1)*100),
			"billing_city":        o.billingCity,
			"check_conditions":    true,
			"tm_code":             o.tmCode,
			"tm_date_cruise":      now.AddDate(0, i+1, 0).Format("2006-01-02"),
			"state_order":         1,
		})
	}

	_, err := orderColl.InsertMany(ctx, orderDocs)
	must(err, "seed orders")
	fmt.Printf("  [ok] orders — %d órdenes insertadas\n", len(orders))

	// Passengers — 2 per order
	titles := []string{"Mr", "Mrs", "Ms", "Dr"}
	nationalities := []string{"American", "French", "German", "British", "Italian"}
	var paxDocs []interface{}
	for i, o := range orders {
		for j := 0; j < 2; j++ {
			paxDocs = append(paxDocs, bson.M{
				"_id":                   primitive.NewObjectID(),
				"pax_id_order":          o.id,
				"pax_title":             titles[(i+j)%len(titles)],
				"pax_first_name":        fmt.Sprintf("Passenger%d", j+1),
				"pax_last_name":         fmt.Sprintf("Family%d", i+1),
				"pax_nationality":       nationalities[i%len(nationalities)],
				"pax_date_month":        fmt.Sprintf("%02d", (i+j+1)%12+1),
				"pax_date_day":          fmt.Sprintf("%02d", (i+j+1)%28+1),
				"pax_date_year":         fmt.Sprintf("%d", 1970+i*5+j*3),
				"pax_passport":          fmt.Sprintf("PP%06d", i*100+j),
				"pax_passport_exp_month": "06",
				"pax_passport_exp_day":  "15",
				"pax_passport_exp_year": "2029",
				"pax_arrival_date":      now.AddDate(0, i+1, 0).Format("2006-01-02"),
				"pax_departure_date":    now.AddDate(0, i+1, 10).Format("2006-01-02"),
				"pax_arrival_flight":    fmt.Sprintf("AA%d", 100+i),
				"pax_departure_flight":  fmt.Sprintf("AA%d", 200+i),
				"pax_type_acomm":        "Double",
				"pax_us_shoe_size":      "9",
				"pax_emergency_contact": "Emergency Contact",
				"pax_restrictions":      "",
				"pax_marital_status":    "Single",
				"data_encrypt":          "",
				"key_encrypt":           "",
			})
		}
	}
	_, err = paxColl.InsertMany(ctx, paxDocs)
	must(err, "seed passengers")
	fmt.Printf("  [ok] passengers — %d pasajeros insertados\n", len(paxDocs))

	// Files — 1 per order
	var fileDocs []interface{}
	for i, o := range orders {
		fileDocs = append(fileDocs, bson.M{
			"_id":            primitive.NewObjectID(),
			"file_id_order":  o.id,
			"file_name":      fmt.Sprintf("booking_confirmation_%d.pdf", i+1),
			"file_name_user": fmt.Sprintf("Confirmación Reserva %d", i+1),
			"file_size":      "124500",
			"file_status":    "1",
			"file_encode":    "",
		})
	}
	_, err = fileColl.InsertMany(ctx, fileDocs)
	must(err, "seed files")
	fmt.Printf("  [ok] files — %d archivos insertados\n", len(fileDocs))
}

// ── main ──────────────────────────────────────────────────────────────────────

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	fmt.Printf("🌱 SBI Seed — conectando a %s\n", uri())
	db, disconnect := connect(ctx)
	defer disconnect()

	fmt.Println("Insertando datos dummy...")
	seedCountries(ctx, db)
	seedSellers(ctx, db)
	seedContacts(ctx, db)
	seedOrdersAndPassengers(ctx, db)
	fmt.Println("✅ Seed completado.")
}
