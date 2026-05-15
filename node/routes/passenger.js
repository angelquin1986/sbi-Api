var express = require('express');

var app = express();

var Passenger = require('../models/passenger');
var Order = require('../models/order');

//===================================
// Obtener todos los pedidos
//===================================
app.get('/', (req, res) =>{
    Passenger.find({})
    .exec((err, passengers)=> {
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando passenger',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            passengers: passengers
        });
    })
});

//===================================
// Obtener Passajeros
//===================================
app.get('/:idorder', ( req, res)=> {
    var idorder = req.params.idorder;

    Passenger.find({ pax_id_order: idorder }, (err, passengers)=>{
        res.status(200).json({
            ok: true,
            passengers: passengers,
            mensaje:'ddd'
        });
    });

});

//===================================
// Obtener Informacion de Pasajero
//===================================
app.get('/findpax/:id', (req, res)=>{
    var id = req.params.id;

    Passenger.findById( id )
        .populate('pax_id_order')
        .exec((err, passenger)=>{
            if( err ) {
                return res.status(500).json({
                   ok: false,
                   mensaje: 'Error al buscar passenger',
                   errors: err
                });
            }
            if( !passenger ) {
                return res.status(400).json({
                   ok: false,
                   mensaje: 'El passenger con el id ' + id + ' no existe',
                   errors: { message: 'No existe un passenger con esr ID' }
                });
            }

            res.status(200).json({
                ok: true,
                passenger: passenger
            });
        });
});


//===================================
// Actualizar Datos Pasajero
//===================================
app.put('/:id', ( req, res )=>{
    var id = req.params.id;
    var body = req.body;

    Passenger.findById( id, ( err, passenger )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar passenger',
                errors: err
            });
        }

        if ( !passenger ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El passenger con id ' + id + ' no existe',
                errors: { message: 'No existe el passenger con ese ID' }
            });
        }

        passenger.pax_title = body.pax_title;
        passenger.pax_first_name = body.pax_first_name;
        passenger.pax_last_name = body.pax_last_name;
        passenger.pax_nationality = body.pax_nationality;
        passenger.pax_date_month = body.pax_date_month;
        passenger.pax_date_day = body.pax_date_day;
        passenger.pax_date_year = body.pax_date_year;
        passenger.pax_passport = body.pax_passport;
        passenger.pax_passport_exp_month = body.pax_passport_exp_month;
        passenger.pax_passport_exp_day = body.pax_passport_exp_day;
        passenger.pax_passport_exp_year = body.pax_passport_exp_year;
        passenger.pax_emergency_contact = body.pax_emergency_contact;
        passenger.pax_insurance_company = body.pax_insurance_company;
        passenger.pax_insurance_number = body.pax_insurance_number;
        passenger.pax_contact_hotel = body.pax_contact_hotel;
        passenger.pax_restrictions = body.pax_restrictions;
        passenger.pax_marital_status = body.pax_marital_status;
        passenger.pax_arrival_date = body.pax_arrival_date;
        passenger.pax_arrival_flight = body.pax_arrival_flight;
        passenger.pax_departure_date = body.pax_departure_date;
        passenger.pax_departure_flight = body.pax_departure_flight;
        passenger.pax_type_acomm = body.pax_type_acomm;
        passenger.pax_us_shoe_size = body.pax_us_shoe_size;
        passenger.pax_hotel_contact = body.pax_hotel_contact,
        passenger.data_encrypt = body.data_encrypt;
        passenger.key_encrypt = body.key_encrypt;

        passenger.save((err, passengerGuardado)=>{
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar passenger',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                passenger: passengerGuardado
            });
        });

    });
});

//===================================
// Crear un nuevo pedido
//===================================
app.post('/', (req, res)=> {
    var body = req.body;
    var passenger = new Passenger({
        pax_title: body.pax_title,
        pax_first_name: body.pax_first_name,
        pax_last_name: body.pax_last_name,
        pax_nationality: body.pax_nationality,
        pax_date_month: body.pax_date_month,
        pax_date_day: body.pax_date_day,
        pax_date_year: body.pax_date_year,
        pax_passport: body.pax_passport,
        pax_passport_exp_month: body.pax_passport_exp_month,
        pax_passport_exp_day: body.pax_passport_exp_day,
        pax_passport_exp_year: body.pax_passport_exp_year,
        pax_emergency_contact: body.pax_emergency_contact,
        pax_insurance_company: body.pax_insurance_company,
        pax_insurance_number: body.pax_insurance_number,
        pax_contact_hotel: body.pax_contact_hotel,
        pax_restrictions: body.pax_restrictions,
        pax_marital_status: body.pax_marital_status,
        pax_arrival_date: body.pax_arrival_date,
        pax_arrival_flight: body.pax_arrival_flight,
        pax_departure_date: body.pax_departure_date,
        pax_departure_flight: body.pax_departure_flight,
        pax_type_acomm: body.pax_type_acomm,
        pax_us_shoe_size: body.pax_us_shoe_size,
        pax_hotel_contact: body.pax_hotel_contact,
        pax_id_order: body.pax_id_order,
        data_encrypt: body.data_encrypt,
        key_encrypt: body.key_encrypt
    });
    passenger.save( ( err, passengerGuardado )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear passenger',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            passenger: passengerGuardado
        });
    });
});


module.exports = app;