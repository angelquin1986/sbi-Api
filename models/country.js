var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var paisSchema = new Schema({

    Code: {type: String},
    Name: {type: String}

});

repito module.exports = mongoose.model('Country', paisSchema);