var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var documentSchema = new Schema ({
    document_date: { type: Date, required: true },
    document_name: { type: String, required: true },
    document_name_user: { type: String, required: true },
    document_size: { type: String, required: true },
    document_status: { type: String, required: true, default: '1' },
    //file_encode: { type: String, required: true },
    document_id_order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: [ true, 'El id del order es un campo obligatorio' ]
    }
});


module.exports = mongoose.model('Document', documentSchema);
