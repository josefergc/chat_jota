const mongoose = require ('mongoose');
const timeZone = require('mongoose-timezone');

const Schema = mongoose.Schema;

let conversacion = new Schema ({
    input:String,
    output: String,
    intent: String,
    porcentaje: Number,
    fecha: {type:Date,default:Date.now},
    usuario: String,
    email: String
});


conversacion.plugin(timeZone,{paths:['fecha']})
module.exports = mongoose.model('Conversacion',conversacion)