var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['OPERADOR_ROLE', 'AGENTE_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

var sellerSchema = new Schema({
    nseller: { type: String, required: [true, 'El nombre es necesario'] },
    mailseller: { type: String, unique:true, required: [true, 'El correo es necesario'] },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    id: { type: String, required: [true, 'El id es necesario'] },
    company: { type: String, required: [true, 'Company es necesario'] },
    nuser: { type: String, required: [true, 'Nombre usuario es necesario'] }
});

sellerSchema.plugin( uniqueValidator, { message: '{PATH} debe de ser unico' } );

module.exports = mongoose.model('Seller', sellerSchema);
