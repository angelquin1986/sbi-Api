var express = require('express');

var app = express();

var Usuario = require('../models/sellers');


app.post('/', (req, res)=>{

    var body = req. body;

    Usuario.findOne({email: body.email},( err, usuarioBD )=>{


        res.status(200).json({
            ok: true,
            mensaje: 'Login post realizada correctamente...',
            body: body
        });
    });
});

module.exports = app;