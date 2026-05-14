var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderShema = new Schema ({
    date_submited: { type: Date, required: true },
    contact_person_name: { type: String, required: [true, 'El nombre del contacto es necesario'] },
    contact_person_mail: { type: String, required: [true, 'El mail del contacto es necesario'] },
    number_pax: { type: Number, required: [true, 'El numero de pasajeros es necesario'] },
    billing_country: { type: String, required: [true, 'El codigo pais es necesario'] },
    billing_phone: { type: String, required: [true, 'El telefono es necesario'] },
    billing_address: { type: String, required: [true, 'La direccion es necesario'] },
    billing_city: { type: String, required: [true, 'La ciudad, estado o postal es necesario'] },
    state_order: { type: Number, required: false },
    check_conditions: { type: Boolean, required: false },
    sales_agent_id: { type: Number, required: true},
    tm_code: { type: Number, required: false },
    tm_date_cruise: { type: Date, required: false }
});

module.exports = mongoose.model('Order', orderShema);
