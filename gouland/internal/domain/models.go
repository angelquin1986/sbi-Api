package domain

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"fmt"
)

// Country representa un país
type Country struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code        string             `bson:"code" json:"code"`
	Name        string             `bson:"name" json:"name"`
	ISO         string             `bson:"iso" json:"iso"`
	CreatedAt   int64              `bson:"created_at" json:"created_at"`
}

// Passenger
type Passenger struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Document  string             `bson:"document" json:"document"`
	Age       int                `bson:"age" json:"age"`
}

// Order
type Order struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Reference   string             `bson:"reference" json:"reference"`
	Status      string             `bson:"status" json:"status"`
	CreatedAt   int64              `bson:"created_at" json:"created_at"`
}

// Seller / Usuario
type Seller struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"-"`
	Name     string             `bson:"name" json:"name"`
}

// Contact
type Contact struct {
	ID    primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name  string             `bson:"name" json:"name"`
	Email string             `bson:"email" json:"email"`
	Phone string             `bson:"phone" json:"phone"`
}

// Document / File metadata
type Document struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name     string             `bson:"name" json:"name"`
	Type     string             `bson:"type" json:"type"`
	Path     string             `bson:"path" json:"path"`
	OwnerID  primitive.ObjectID `bson:"owner_id,omitempty" json:"owner_id"`
}

// HexToObjectID converts a hex string to ObjectID or returns NilObjectID on invalid
func HexToObjectID(h string) primitive.ObjectID {
	if h == "" { return primitive.NilObjectID }
	id, err := primitive.ObjectIDFromHex(h)
	if err != nil { fmt.Printf("invalid objectid hex: %s\n", h); return primitive.NilObjectID }
	return id
}
