const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const assistant = new AssistantV2({
  version: '2019-02-28',
  authenticator: new IamAuthenticator({
    apikey: 'evPyE-by0kwE1Xg8Y0Y1V4Tkf_EgNtcGmjFaBAz0fDrX',
  }),
  url: 'https://gateway.watsonplatform.net/assistant/api',
});

const express = require('express');
const socketIO = require('socket.io');
const http = require('http');

const path = require('path');

const app = express();
let server = http.createServer(app);

app.get('/sesion', function(req,res){

    assistant.createSession({
        assistantId: '15363595-53f2-4883-9533-a24676e30e6d'
    })
    .then(response => {
        console.log(response.result)
        res.json(response.result); 
    })
    .catch(err => {
        console.log(err);
        res.json(err);
    });
});

app.get('/respuesta', function(req,res){
    
    const sesion = req.headers.sesion;
    const mensaje = req.headers.mensaje;
    

    const params = {
        assistantId: '15363595-53f2-4883-9533-a24676e30e6d',
        sessionId: sesion,
        input:{
            'message_type' : 'text',
            'text': mensaje    
        }       
    };
    console.log(params);
    assistant.message(params)
    .then(response => {
        console.log(response.result)
        res.json(response.result); 
    })
    .catch(err => {
        console.log(err);
        res.json(err);
    });
});

const publicPath = path.resolve(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));

// IO = esta es la comunicacion del backend
module.exports.io = socketIO(server);
require('./sockets/socket');





server.listen(port, (err) => {

    if (err) throw new Error(err);

    console.log(`Servidor corriendo en puerto ${ port }`);

});