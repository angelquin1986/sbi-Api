var express = require('express');

var app = express();

var Pais = require('../models/country');

//===================================
// Obtener todos los paises
//===================================
app.get('/', ( req, res, next )  => {

    Pais.find({})
    .exec(
        ( err, paises )=>{
        if ( err ){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando paises',
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            paises: paises
        });
    })
});

module.exports = app;