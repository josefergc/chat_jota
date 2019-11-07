const express = require('express');
var fs = require('fs');
 
const app = express();

const errorItem = require('../collection/collection');
const archivo = require('../collection/file');



const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const assistant = new AssistantV2({
  version: '2019-02-28',
  authenticator: new IamAuthenticator({
    apikey: 'evPyE-by0kwE1Xg8Y0Y1V4Tkf_EgNtcGmjFaBAz0fDrX',
  }),
  url: 'https://gateway.watsonplatform.net/assistant/api',
});


app.get('/sesion', function(req, res){

    assistant.createSession({
        assistantId: '15363595-53f2-4883-9533-a24676e30e6d'
    })
    .then(response => {
        console.log(response.result);
        //let errorSession = new errorItem({
        //    error: 'campo 1',
        //    descripcion: 'Campo 2'
        //}); 
        //errorSession.save();
        
        res.json(response.result); 
    })
    .catch(err => {
        console.log(err);
        archivo.guardarLog('No se pudo crear la sesion '+ JSON.stringify(err));
        
        res.status(400).json({
            code:400,
            ok: false,
            err
        });
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
        console.log(response)
        res.json(response); 
    })
    .catch(err => {
        console.log(err);
        res.status(400).json({
            ok: false,
            err
        });
    });
});

app.get('/errorjota', function(req,res){

    
    var contents = fs.readFileSync('./server/log/filelog.txt', 'utf8');

    var body = '<html>' + 
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html" charset="utf-8">' +
            '<link href="assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet">' +
            '</head>' +
            '<body>' +
            '<div class="container">' +
            '<h1>Erorres</h1>' + contents +
            '</div>' +
            '</body>' +
            '</html>';

    console.log(body);
    res.writeHead(200,{"Content-Type": "text/html"});
    res.write(body);
    res.end();
});



module.exports = app;