const mongoose = require ('mongoose');

const Schema = mongoose.Schema;

let errorSchema = new Schema ({
    fecha: { type: Date, default: Date.now},
    error: String,
    descripcion: String

});



module.exports = mongoose.model('Error', errorSchema)