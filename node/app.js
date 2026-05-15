// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// CORS
app.use(function(req, res, next) {

    const allowedOrigins = [
        'https://experiencesouthamerica.travel',
        'https://www.experiencesouthamerica.travel'
    ];

    if (allowedOrigins.includes(req.headers.origin)) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");         
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// Importar Rutas
var loginRoutes = require('./routes/login');
var countryRoutes = require('./routes/country');
var passengerRoutes = require('./routes/passenger');
var usuarioRoutes = require('./routes/seller');
var orderRoutes = require('./routes/order');
var busquedaRoutes = require('./routes/busqueda');
var contactosRoutes = require('./routes/contactos');
var uploadRoutes = require('./routes/upload');
var archivoRoutes = require('./routes/archivo');
var appRoutes = require('./routes/app');

// Conexion a la Base de Datos (hospitalDB por defecto taba)
mongoose.connection.openUri('mongodb://localhost:27017/bookingDB', ( err, res ) => {
    if( err ) throw err;
        console.log('Conexion a Base de Datos Booking Experience Southamerica en Mongo Atlas: \x1b[32m%s\x1b[0m', ' online');
});

    
// Rutas
app.use('/login', loginRoutes);
app.use('/country', countryRoutes);
app.use('/pax', passengerRoutes);
app.use('/order', orderRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/contactos', contactosRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/archivo', archivoRoutes);
app.use('/', appRoutes);

// Escuchar Peticiones

app.listen(4000, () => {
    console.log('Express server puerto 4000: \x1b[32m%s\x1b[0m', ' online')
});