var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('email') || !params.has('telefono')) {
    window.location = 'index.html';
    throw new Error('Todos los campos son necesarios');
}

var usuario = {
    nombre: params.get('nombre'),
    email: params.get('email'),
    telefono: params.get('telefono')
}

var saludo = '';
let idSesion = "";
var respuesta = [];


const getSession = async ()=> {
    
    const uri = 'https://jota-chat.herokuapp.com/sesion';

    const response = await (await fetch(uri, {
        method:'GET',
        headers: { 'Content-Type': 'application/json'},
    })).json();
    
   idSesion = response.session_id;
   console.log(idSesion);
}

async function getrespuesta (numsesion,mensaje) {
    
    try{
        //const encodeMensaje = encodeURI(mensaje);
        const uri = 'https://jota-chat.herokuapp.com/respuesta';
        
        const response = await (await fetch(uri, {
            method:'GET',
            headers: { 'Content-Type': 'application/json',
                        'sesion': numsesion,
                        'mensaje': mensaje    
            }
        })).json();

        return response;
    }catch(err){
        console.log(err);
    }
}

getSession();

//referencias de jQuery
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var btnMensaje =$('#btnMensaje');


function EscogerOpcion(texto) {
    responderJota(texto)
        .then(console.log)
        .catch(console.log);
    
        scrollBottom(); 
}

function renderJota(mensaje) {

    var posicion = mensaje.search("OPTION_");
    var adicional = false;
    let msAdd =  '';mensaje.substring(posicion+8,mensaje.length-1);
    

    if (posicion > -1){
        adicional = true;
        msAdd =  mensaje.substring(posicion+8,mensaje.length-1);
        mensaje = mensaje.substring(0,posicion-2);
    }
        
    
    var html ='';
            

    html += '<li>';
    html += '<div class="chat-img"><img src="assets/images/users/jota_user.png" alt="user" /></div>';
    html += '<div class="chat-content">';
    html += '<div class="box bg-light-inverse">'+ mensaje+'</div></div>';
    html += '</li>';

    if (adicional){
        var opciones = msAdd.split(",");
        let opcion = [];
        html += '<li>';
        html += '<div class="chat-div">';
    
        for (var i = 0; i < opciones.length; i++){
            opcion = opciones[i].split("\"");
            html += '<div class="chat-opcion" onclick="EscogerOpcion(\''+opcion[1]+'\')">'+ opcion[1]+'</div>';
        }
        
        html += '</div></li>';
    }
    else{
        txtMensaje.prop('disabled',false);
        btnMensaje.prop('disabled',false);
        txtMensaje.val('').focus();
        
    }

    divChatbox.append(html);
    
}

const responderJota = async (mensaje) => {
    try{
        console.log(mensaje);
        const responder = await getrespuesta(idSesion,mensaje);
       
        renderJota(responder.output.generic[0].text);
        scrollBottom();       
        

    }catch(e){
        return 'No se pudo obtener respuesta' + e;
    }

}

function scrollBottom() {

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    divChatbox.scrollTop(scrollHeight);
/*
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }*/
}
function renderMensaje(mensaje) {

    var html ='';
    var fecha = new Date();
    var hora = fecha.getHours();
    var minut = fecha.getMinutes();
    var ampm = hora >= 12 ? 'pm' : 'am';
    var minutos = minut > 9 ? minut : '0'+minut;
    if (hora > 12)
        hora = hora - 12;
    
    hora = hora + ':' + minutos + ' ' + ampm;


    html +='<li class="reverse">'
    html +='<div class="chat-content">';
    html +='<div class="box bg-light-info">'+ mensaje+ '</div>';
    html +='<div class="chat-time">'+hora+'</div></div>';
    html +='<li>';

    divChatbox.append(html);
}

//Listeners
formEnviar.on('submit', function(event){

    event.preventDefault();

    if (txtMensaje.val().trim().length === 0) {
        return;
    }
        
    renderMensaje(txtMensaje.val());
    txtMensaje.prop('disabled',true);
    btnMensaje.prop('disabled',true);

    responderJota(txtMensaje.val())
        .then(console.log)
        .catch(console.log);
    
    console.log(idSesion);
    
    txtMensaje.val('').focus();
        
});