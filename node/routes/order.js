var express = require('express');

var app = express();

var Order = require('../models/order');

//===================================
// Obtener todos los pedidos
//===================================
app.get('/', ( req, res, next )  => {

    Order.find({})
    .exec(
        ( err, orders )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando orders',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            orders: orders
        });
    })
});

//===================================
// Obtener cabecera order
//===================================
app.get('/:id', ( req, res)=> {
    var id = req.params.id;
    Order.findById(id)
        .populate('order')
        .exec((err, order) => {
            if (err) {
                return res.status(200).json({
                    ok: false,
                    mensaje: 'Error al buscar cabecera order',
                    errors: err,
                    order: []
                });
            }
        if (!order) {
            return res.status(200).json({
                    ok: false,
                    mensaje: 'La cabecera order con el id ' + id + 'no existe',
                    errors: { message: 'No existe cabecera order con ese ID' },
                order: []
                });
        }
        res.status(200).json({
            ok: true,
            order: order
        });
    })
});

//===================================
// Actualizar pedido
//===================================
app.put('/:id', ( req, res )=>{
    var id = req.params.id;
    var body = req.body;

    Order.findById( id, ( err, order )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar order',
                errors: err
            });
        }

        if ( !order ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El order con id ' + id + ' no existe',
                errors: { message: 'No existe el order con ese ID' }
            });
        }

        order.contact_person_name = body.contact_person_name;
        order.contact_person_mail = body.contact_person_mail;
        order.number_pax = body.number_pax;
        order.billing_country = body.billing_country;
        order.billing_phone = body.billing_phone;
        order.billing_address = body.billing_address;
        order.billing_city = body.billing_city;
        order.tm_code = body.tm_code;
        order.tm_date_cruise = body.tm_date_cruise;

        order.save((err, orderGuardado)=>{
            if ( err ){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar order',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                order: orderGuardado
            });
        });

    });
});

//===================================
// Crear un nuevo pedido
//===================================
app.post('/', (req, res)=>{
    var body = req.body;

    var order = new Order({
        date_submited: body.date_submited,
        contact_person_name: body.contact_person_name,
        contact_person_mail: body.contact_person_mail,
        sales_agent_id: body.sales_agent_id,
        number_pax: body.number_pax,
        billing_country: body.billing_country,
        billing_phone: body.billing_phone,
        billing_address: body.billing_address,
        billing_city: body.billing_city,
        check_conditions: body.check_conditions,
        tm_code: body.tm_code,
        tm_date_cruise: body.tm_date_cruise,
        state_order: 1
    });

    order.save( ( err, orderGuardado )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear order',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            order: orderGuardado
        });
    });

});




module.exports = app;
