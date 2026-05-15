var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var contactSchema = new Schema ({
    nombre: { type: String, required: [ true, 'El nombre es necesario' ] },
    cargo: { type: String, required: [ true, 'El cargo es necesario' ] },
    mail: { type: String, required: [ true, 'El mail es necesario' ] },
    cel_ofi: { type: String, required: [ true, 'El celular es necesario' ] },
    ext: { type: String},
    ext_Royal_GPS: { type: String },
    ext_Ip: { type: String }

});

module.exports = mongoose.model('Contact', contactSchema);