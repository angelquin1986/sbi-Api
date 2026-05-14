var express = require('express');
var app = express();





app.get('/', ( req, res, next )  => {

    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente...al servidor backend SBI de Experience Southamerica...!!',

    });
});

module.exports = app;