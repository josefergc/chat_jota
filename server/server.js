require('../config/config');

const express = require('express');
const http = require('http');
const path = require('path');

const mongoose = require('mongoose');

const app = express();
let server = http.createServer(app);

const publicPath = path.resolve(__dirname, '../public/');
app.use(express.static(publicPath));
app.use(require('./watson/watson'));



mongoose.connect(urlDB,
    { useNewUrlParser: true, useUnifiedTopology:true},  (err,res) =>{
    
    if (err) throw err;

    console.log('Conectado con la base de datos');
});


const port = process.env.PORT || 3000;


// IO = esta es la comunicacion del backend

server.listen(port, (err) => {

    if (err) throw new Error(err);

    console.log(`Servidor corriendo en puerto ${ port }`);

});