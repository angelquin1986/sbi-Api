var express = require('express');
var app = express();

var Contact = require('../models/contact')

app.get('/', ( req, res, next )  => {
    Contact.find({}, '').exec(
    (err, contactos)=>{
        if ( err ) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error cargar info seller',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            contact: contactos
        });
    });
});

module.exports = app;
