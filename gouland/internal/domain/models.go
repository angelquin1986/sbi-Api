package domain

import (
"fmt"
"time"

"go.mongodb.org/mongo-driver/bson/primitive"
)

// Country representa un país
type Country struct {
ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
Code      string             `bson:"code" json:"code"`
Name      string             `bson:"name" json:"name"`
ISO       string             `bson:"iso" json:"iso"`
CreatedAt int64              `bson:"created_at" json:"created_at"`
}

// Passenger — campos idénticos al modelo Mongoose original
type Passenger struct {
ID                  primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
PaxTitle            string             `bson:"pax_title" json:"pax_title"`
PaxFirstName        string             `bson:"pax_first_name" json:"pax_first_name"`
PaxLastName         string             `bson:"pax_last_name" json:"pax_last_name"`
PaxNationality      string             `bson:"pax_nationality" json:"pax_nationality"`
PaxDateMonth        string             `bson:"pax_date_month" json:"pax_date_month"`
PaxDateDay          string             `bson:"pax_date_day" json:"pax_date_day"`
PaxDateYear         string             `bson:"pax_date_year" json:"pax_date_year"`
PaxPassport         string             `bson:"pax_passport" json:"pax_passport"`
PaxPassportExpMonth string             `bson:"pax_passport_exp_month" json:"pax_passport_exp_month"`
PaxPassportExpDay   string             `bson:"pax_passport_exp_day" json:"pax_passport_exp_day"`
PaxPassportExpYear  string             `bson:"pax_passport_exp_year" json:"pax_passport_exp_year"`
PaxEmergencyContact string             `bson:"pax_emergency_contact" json:"pax_emergency_contact"`
PaxInsuranceCompany string             `bson:"pax_insurance_company" json:"pax_insurance_company"`
PaxInsuranceNumber  string             `bson:"pax_insurance_number" json:"pax_insurance_number"`
PaxContactHotel     string             `bson:"pax_contact_hotel" json:"pax_contact_hotel"`
PaxRestrictions     string             `bson:"pax_restrictions" json:"pax_restrictions"`
PaxMaritalStatus    string             `bson:"pax_marital_status" json:"pax_marital_status"`
PaxArrivalDate      string             `bson:"pax_arrival_date" json:"pax_arrival_date"`
PaxArrivalFlight    string             `bson:"pax_arrival_flight" json:"pax_arrival_flight"`
PaxDepartureDate    string             `bson:"pax_departure_date" json:"pax_departure_date"`
PaxDepartureFlight  string             `bson:"pax_departure_flight" json:"pax_departure_flight"`
PaxTypeAcomm        string             `bson:"pax_type_acomm" json:"pax_type_acomm"`
PaxUsShoeSize       string             `bson:"pax_us_shoe_size" json:"pax_us_shoe_size"`
PaxHotelContact     string             `bson:"pax_hotel_contact" json:"pax_hotel_contact"`
DataEncrypt         bool               `bson:"data_encrypt" json:"data_encrypt"`
KeyEncrypt          string             `bson:"key_encrypt" json:"key_encrypt"`
PaxIdOrder          primitive.ObjectID `bson:"pax_id_order" json:"pax_id_order"`
}

// Order — campos idénticos al modelo Mongoose original
type Order struct {
ID                primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
DateSubmited      time.Time          `bson:"date_submited" json:"date_submited"`
ContactPersonName string             `bson:"contact_person_name" json:"contact_person_name"`
ContactPersonMail string             `bson:"contact_person_mail" json:"contact_person_mail"`
NumberPax         int                `bson:"number_pax" json:"number_pax"`
BillingCountry    string             `bson:"billing_country" json:"billing_country"`
BillingPhone      string             `bson:"billing_phone" json:"billing_phone"`
BillingAddress    string             `bson:"billing_address" json:"billing_address"`
BillingCity       string             `bson:"billing_city" json:"billing_city"`
StateOrder        int                `bson:"state_order" json:"state_order"`
CheckConditions   bool               `bson:"check_conditions" json:"check_conditions"`
SalesAgentID      int                `bson:"sales_agent_id" json:"sales_agent_id"`
TmCode            int                `bson:"tm_code" json:"tm_code"`
TmDateCruise      *time.Time         `bson:"tm_date_cruise" json:"tm_date_cruise"`
}

// Seller / Usuario — campos idénticos al modelo Mongoose original
type Seller struct {
ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
NSeller    string             `bson:"nseller" json:"nseller"`
MailSeller string             `bson:"mailseller" json:"mailseller"`
Role       string             `bson:"role" json:"role"`
SellerID   string             `bson:"id" json:"id"`
Company    string             `bson:"company" json:"company"`
NUser      string             `bson:"nuser" json:"nuser"`
Password   string             `bson:"password,omitempty" json:"-"`
}

// Contact — campos idénticos al modelo Mongoose original
type Contact struct {
ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
Nombre      string             `bson:"nombre" json:"nombre"`
Cargo       string             `bson:"cargo" json:"cargo"`
Mail        string             `bson:"mail" json:"mail"`
CelOfi      string             `bson:"cel_ofi" json:"cel_ofi"`
Ext         string             `bson:"ext" json:"ext"`
ExtRoyalGPS string             `bson:"ext_Royal_GPS" json:"ext_Royal_GPS"`
ExtIp       string             `bson:"ext_Ip" json:"ext_Ip"`
}

// File / Archivo — modelo para metadatos de archivos en MongoDB
type File struct {
ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
FileName     string             `bson:"file_name" json:"file_name"`
FileNameUser string             `bson:"file_name_user" json:"file_name_user"`
FileSize     string             `bson:"file_size" json:"file_size"`
FileStatus   string             `bson:"file_status" json:"file_status"`
FileEncode   string             `bson:"file_encode" json:"file_encode"`
FileIdOrder  primitive.ObjectID `bson:"file_id_order" json:"file_id_order"`
}

// Document (para uso futuro)
type Document struct {
ID      primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
Name    string             `bson:"name" json:"name"`
Type    string             `bson:"type" json:"type"`
Path    string             `bson:"path" json:"path"`
OwnerID primitive.ObjectID `bson:"owner_id,omitempty" json:"owner_id"`
}

func HexToObjectID(h string) primitive.ObjectID {
if h == "" {
return primitive.NilObjectID
}
id, err := primitive.ObjectIDFromHex(h)
if err != nil {
fmt.Printf("invalid objectid hex: %s\n", h)
return primitive.NilObjectID
}
return id
}
