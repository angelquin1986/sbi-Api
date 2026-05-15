var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var fileSchema = new Schema ({
    file_name: { type: String, required: true },
    file_name_user: { type: String, required: true },
    file_size: { type: String, required: true },
    file_status: { type: String, required: true, default: '1' },
    file_encode: { type: String, required: false },
    file_id_order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: [ true, 'El id del order es un campo obligatorio' ]
    }
});


module.exports = mongoose.model('File', fileSchema);
