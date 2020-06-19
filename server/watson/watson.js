require('../config/config');


const express = require('express');
var fs = require('fs');
 
const app = express();

const intencion = require('../collection/collection');
const archivo = require('../collection/file');



const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const assistant = new AssistantV2({
  version: '2019-02-28',
  authenticator: new IamAuthenticator({
    apikey: watsonAPI,
    //apikey: 'pmORdu5JkxdjGB-6y37IMV-N-lO7AL76AAfo_5l14D5y',
  }),
  url: watsonUrl,
  //url: 'https://api.us-east.assistant.watson.cloud.ibm.com/instances/d6c38260-189e-4bbc-893f-9eaf46ce8392',
});


app.get('/sesion', function(req, res){

    assistant.createSession({
        assistantId: watsonAssistantID
        //assistantId: 'a426ba54-d8e6-4990-a707-35b6ae1707a6'
    })
    .then(response => {
        console.log(response.result);
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
    const usuario = req.headers.usuario;
    const email = req.headers.email;
    

    const params = {
        assistantId: watsonAssistantID,
        //assistantId: 'a426ba54-d8e6-4990-a707-35b6ae1707a6',
        sessionId: sesion,
        input:{
            'message_type' : 'text',
            'text': mensaje    
        }       
    };
    console.log(params);
    assistant.message(params)
    .then(response => {
        console.log('Response de Respuesta:');
     
        let intension = "";
        let porcentaje = "";
        let salida = "";
     
        if (response.result.output.intents[0])
        {
            intension = response.result.output.intents[0].intent;
            porcentaje = response.result.output.intents[0].confidence;
        }
        if (response.result.output.generic[0])
            salida = response.result.output.generic[0].text;
          
        if (response.status===200) {
            let conversacion = new intencion({
                input: mensaje,
                output: salida,
                intent: intension,
                porcentaje: porcentaje,
                usuario: usuario,
                email: email
            }); 
            conversacion.save();
            
            
        }
        console.log(response);
        res.json(response); 
    })
    .catch(err => {
        console.log('Catch de respuesta Error:' + err);
        console.log(err);
        let idError = 400;
        if (err.code)
            idError = err.code;
        res.status(idError).json({
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