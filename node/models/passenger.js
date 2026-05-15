var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var passengerSchema = new Schema ({
    pax_title: { type: String, required: true },
    pax_first_name: { type: String, required: [ true, 'El nombre es necesario' ] },
    pax_last_name: { type: String, required: [ true, 'El apellido es necesario' ] },
    pax_nationality: { type: String, required: [ true, 'La nacionalidad es necesaria' ] },
    pax_date_month: { type: String, required: [ true, 'El mes de nacimiento es necesario' ] },
    pax_date_day: { type: String, required: [ true, 'El día de nacimiento es necesario' ] },
    pax_date_year: { type: String, required: [ true, 'El año de nacimiento es necesario' ] },
    pax_passport: { type: String, required: [ true, 'El numero de pasaporte es necesario' ] },
    pax_passport_exp_month: { type: String, required: [ true, 'El mes de expiracion pasaporte es necesario' ] },
    pax_passport_exp_day: { type: String, required: [ true, 'El dia de expiracion pasaporte es necesario' ] },
    pax_passport_exp_year: { type: String, required: [ true, 'El año de expiracion pasaporte es necesario' ] },
    pax_emergency_contact: { type: String, required: [ true,  'El contacto de emergencia es necesario' ] },
    pax_insurance_company: { type: String },
    pax_insurance_number: { type: String },
    pax_contact_hotel: { type: String },
    pax_restrictions: { type: String, required: [ true, 'El estado civiles necesario' ] },
    pax_marital_status: { type: String },
    pax_arrival_date: { type: String },
    pax_departure_date: { type: String },
    pax_arrival_flight: { type: String },
    pax_departure_flight: { type: String },
    pax_type_acomm: { type: String },
    pax_us_shoe_size: {type: String},
    pax_hotel_contact: {type: String},
    data_encrypt: { type: Boolean },
    key_encrypt: { type: String },
    pax_id_order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: [ true, 'El id del order es un campo obligatorio' ]
    }
});

module.exports = mongoose.model('Passenger', passengerSchema);