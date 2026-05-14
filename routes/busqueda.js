var express = require('express');

var app = express();

var Passenger = require('../models/passenger');
var Order = require('../models/order');

// ========================================
// Busqueda de Pedido  con sus psasajeros
// ========================================
app.get('/pedido/:idcab', ( req, res, next )  => {

    var codigoPedido = req.params.idcab;

    Promise.all( [
        buscarOrder(codigoPedido),
        buscarPasajeros(codigoPedido) ] )
        .then( respuestas =>{
            res.status(200).json({
                ok: true,
                order: respuestas[0],
                //passengers: respuestas[1]
                passengers: respuestas[0].push(respuestas[1])
            });
        })
});

app.get('/coleccion/:tabla/:idcab', (req, res) => {
    var codigoPedido = req.params.idcab;
    var tabla = req.params.tabla;

    var promesa;

    switch (tabla) {
        case 'order':
            promesa = buscarOrder(codigoPedido);
            break;
        case 'pasajeros':
            promesa = buscarPasajeros(codigoPedido);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: ' solo order y seller'
            });
    }
    promesa.then( data =>{
        res.status(200).json({
            ok: true,
            [tabla]:data
        });
    });
});

function buscarOrder( codigo ) {

    return new Promise((resolve, reject) =>{
        Order.find({ _id: codigo }, (err, order) =>{
            if( err ) {
                reject('Error al cargar la info de la Order', err);
            }else{
                resolve(order)
            }
        });
    });
}

function buscarPasajeros( codigo ) {

    return new Promise((resolve, reject) =>{
        Passenger.find({ pax_id_order: codigo }, (err, passenger) =>{
            if( err ) {
                reject('Error al cargar la info de los Pasajeros', err);
            }else{
                resolve(passenger)
            }
        });
    });

}

// ========================================
// Busqueda de Orders por Agente
// ========================================


app.get('/orders/:roleAgente/:idAgente/:fini/:ffin/:nameContact/:tm', ( req, res, next)=>{
    try {
        var tm = req.params.tm;
        var nameContact = req.params.nameContact;
        var ffin = req.params.ffin;
        var fini = req.params.fini;
        var idAgente = req.params.idAgente;
        var roleAgente = req.params.roleAgente;

        var ids = idAgente.split('-');

        //console.log(ids );
        if (roleAgente != 'OPERACION_ROLE') {
            if (nameContact !=0 ){
                if (tm != '-') {
                    Order.find({$and: [{ date_submited: {$gte: fini, $lte: ffin } },
                            {state_order: 1},
                            {sales_agent_id: idAgente},
                            {contact_person_name: {$regex: ".*"+nameContact, $options:"i"}},
                            {tm_code: tm}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                } else {
                    Order.find({$and: [{ date_submited: {$gte: fini, $lte: ffin } },
                            {state_order: 1},
                            {sales_agent_id: idAgente},
                            {contact_person_name: {$regex: ".*"+nameContact, $options:"i"}}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                }

            } else {

                if (tm != '-') {
                    Order.find({$and: [{ date_submited: {$gte: fini, $lte: ffin } },
                            {state_order: 1},
                            {sales_agent_id: idAgente},
                            {tm_code: tm}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                } else {
                    Order.find({$and: [{ date_submited: {$gte: fini, $lte: ffin }},
                            {state_order: 1},
                            {sales_agent_id: idAgente}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                }
            }
        } else {

            if (nameContact == 0) {
                if (tm == '-') {
                    Order.find({$and: [{state_order: 1},{sales_agent_id: {$in: ids}},{ date_submited: {$gte: fini, $lte: ffin }}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                } else {
                    Order.find({$and: [{state_order: 1},{sales_agent_id: {$in: ids}},{ date_submited: {$gte: fini, $lte: ffin }},
                            {tm_code: tm}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                }
            } else {

                if (tm == '-') {
                    Order.find({$and: [{state_order: 1},{sales_agent_id: {$in:ids}},{ date_submited: {$gte: fini, $lte: ffin }},
                            {contact_person_name: {$regex: ".*"+nameContact, $options:"i"}}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                } else {
                    Order.find({$and: [{state_order: 1},{sales_agent_id: {$in:ids}},{ date_submited: {$gte: fini, $lte: ffin }},
                            {tm_code: tm},
                            {contact_person_name: {$regex: ".*"+nameContact, $options:"i"}}]}, (err, orders )=>{
                        res.status(200).json({
                            ok: true,
                            orders: orders,
                            cant: orders.length
                        });
                    });
                }
            }
        }
    } catch (e) {

    }
});


// Agrupa por mes
app.get('/mes/:idAgente', ( req, res, next)=>{
    var idAgente = req.params.idAgente;
    var ids = idAgente.split('-').map(function(item) {
        return parseInt(item, 10);
    });
//console.log(ids );
    Order.aggregate([
        {$match:
                {sales_agent_id: {$in: ids }}
        },
        {$group:
                { _id:  { $dateToString: { format: "%m %Y", date: "$date_submited" } } ,
                    cant: {$sum:1} }
        }
    ], (err, orders )=>{
        res.status(200).json({
            ok: true,
            orders: orders
        })
    });

});

// Cuenta las orders con tm_date
app.get('/cuentaTM/:idAgente', ( req, res, next)=>{
    var idAgente = req.params.idAgente;
    var ids = idAgente.split('-').map(function(item) {
        return parseInt(item, 10);
    });
    Order.aggregate([
        {$match:
                {sales_agent_id: {$in: ids }}
        },
        {$project:
                {tm_date:{$cond:[{$or : [ { $eq:["$tm_date_cruise", null] },
                                { $eq:["$tm_date_cruise", ""] },
                                { $not:["$tm_date_cruise" ] }
                            ]} , "Incomplete", "Complete"]}}},
        {$group:
                { _id: '$tm_date' ,
                    cant: {$sum:1}
                }
        }], (err, cuenta ) => {
        res.status(200).json({
            ok: true,
            cuenta: cuenta
        })
    });

});


// Cuenta las orders con tm_date
app.get('/cuentaTMs', ( req, res, next)=>{
    Order.find({
        $and:[
            {tm_date_cruise: {$exists:true}},
            {tm_date_cruise: {$ne: ""}},
            {tm_date_cruise: {$ne: null}}
        ]
    }, (err, cuenta ) => {
        res.status(200).json({
            ok: true,
            cuenta: cuenta
        })
    }).count();

});


module.exports = app;
