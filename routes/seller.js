var express = require('express');

var bcrypt = require('bcryptjs');

var app = express();

var Seller = require('../models/sellers');

//===================================
// Obtener todos los seller
//===================================

app.get('/', ( req, res, next ) => {
    Seller.find({}, 'nseller mailseller nuser role id')
    .exec(
        (err, seller)=>{
        if ( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error cargar seller',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuarios: seller
        });
    })
});


//===================================
// Obtener todos los seller vendedor
//===================================

app.get('/vendedor', ( req, res, next ) => {
    Seller.find({}, 'nseller mailseller nuser role id')
    .exec(
        (err, seller)=>{
    if ( err ) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error cargar seller',
            errors: err
        });
    }
    res.status(200).json({
    ok: true,
    usuarios: seller
});
})
});


//===================================
// Obtener un seller por correo
//===================================

app.get('/:correo', ( req, res, next ) => {
    var correo = req.params.correo;
    Seller.find({mailseller: correo}, 'nseller mailseller nuser role id company')
    .exec(
        (err, seller)=>{
    if ( err ) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error cargar seller',
            errors: err
        });
    }
    res.status(200).json({
    ok: true,
    usuarios: seller
});
})
});

//===================================
// Obtener un seller por id
//===================================

app.get('/seller/:id', ( req, res, next ) => {
    var id = req.params.id;
    Seller.find({id: id}, 'nseller mailseller nuser role id')
    .exec(
        (err, seller)=>{
        if ( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error cargar info seller',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            usuario: seller
        });
    })
});

//===================================
// Obtener un seller por nombre de usuario
//===================================

app.get('/user/:nombre', ( req, res, next ) => {
    var nombre = req.params.nombre;
Seller.find({nuser: nombre}, 'nseller mailseller nuser role id')
    .exec(
        (err, seller)=>{
    if ( err ) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error cargar info seller por nombre user',
            errors: err
        });
    }
    res.status(200).json({
        ok: true,
        usuario: seller
    });
})
});


//===================================
// Obtener sellers por company
//===================================

app.get('/company/:nombre', ( req, res, next ) => {
    var nombre = req.params.nombre;
    Seller.find({company: nombre}, 'nseller mailseller nuser role id')
    .exec(
        (err, seller)=>{
    if ( err ) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error cargar seller by company',
            errors: err
        });
    }
    res.status(200).json({
        ok: true,
        usuarios: seller
    });
})
});

//===================================
// Actualizar un seller
//===================================
app.put('/:id', ( req, res ) => {

    var id = req.params.id;
    var body = req.body;

Seller.findById( id, (err, seller) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar seller',
                errors: err
            });
        }
        if( !seller ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El seller con el id ' + id + ' no existe',
                errors: { message: 'No existe un seller con es ID' }
            });
        }

        seller.id = body.id;
        seller.nseller = body.nseller;
        seller.mailseller = body.mailseller;
        seller.role = body.role;

        seller.save( (err, sellerGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar seller',
                    errors: err
                });
            }

            sellerGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: sellerGuardado
            });
        });
    });
});




//===================================
// Crear un nuevo seller
//===================================
app.post('/', (req, res) => {

    var body = req.body;

    var seller = new Usuario({
        id: body.id,
        nseller: body.nseller,
        mailseller: body.mailseller,
        role: body.role
    });

    seller.save( ( err, sellerGuardado ) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear seller',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: sellerGuardado
        });

    });

});

//===================================
// Borrar un seller por el id
//===================================
app.delete('/:id', (req, res) =>{
    var id = req.params.id;

    Seller.findByIdAndRemove(id, (err, sellerBorrado)=>{
        if ( err ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al borrar seller',
                errors: err
            });
        }
        if ( !sellerBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un seller con es id',
                errors: { message: 'No existe un seller con es id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: sellerBorrado
        });
    });

});


module.exports = app;