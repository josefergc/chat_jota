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
var htmltemp = '';
let numImagen = 0;
let imagedir = 'https://imagenes-jota.s3.us-east-2.amazonaws.com/';

const getSession = async ()=> {
    
    //const uri = 'https://jota-chat.herokuapp.com/sesion';
    const uri = 'http://localhost:3000/sesion';

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
        //const uri = 'https://jota-chat.herokuapp.com/respuesta';
        const uri = 'http://localhost:3000/respuesta';
        
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
var btnMensaje = $('#btnMensaje');
var modalImagen= $('#modalImagen');
var imgCanvas= $('#imgCanvas');

function EscogerOpcion(texto) {
    divChatbox.html(htmltemp);
    
    renderMensaje(texto);
    
 
    responderJota(texto)
        .then(console.log)
        .catch(console.log);
    
        scrollBottom(); 
}

function agrandarImagen(idImagen) {
    imgCanvas.attr("src", idImagen.src)
    modalImagen.attr("style","display:block");
}

function transformarMensaje(tipo, mensaje, separador) {
    let html = '';
    let posicion = mensaje.search("\]");
    var msModificado = mensaje.substring(0,posicion);
    
    if (separador)
        var itemList = msModificado.split(separador);

    switch(tipo){
        case "lista":
            html += '<ul class="lista-style">';
            for (var i = 0; i < itemList.length; i++){
                html += '<li class="lista-item">'+itemList[i]+'</li>';
            }
            html += '</ul>';
            break;

        case "link":
            
            html += '<a href='+itemList[0] + ' ';
            if (itemList[1].substring(1,4)=== 'img')
                html += '><img src="/assets/images/icons/'+itemList[1].substring(5,itemList[1].length-1)+ '"></a>';
            else
                html += 'target="_blank">'+itemList[1].substring(5,itemList[1].length-1)+'</a>';
            break;
    
        case "image":
            numImagen++;
            msModificado = msModificado.substring(0,posicion);
            html += '<div class="container-imagen-chat">';
            html += '<img id="imagen'+numImagen+'" class="imagen-chat" src="'+ imagedir + msModificado+'"  style="width:100px;" onclick="agrandarImagen(imagen'+numImagen+')">';   
            html += '</div>'; 
            break;
    }
          

    
        
    //mensaje = mensaje.substring(0,lista-1) + htmlLista + mensaje.substring(posicion+lista+8,mensaje.length);
    return html + mensaje.substring(posicion+1);
}

function renderJota(mensaje) {

    var posicion;
    var adicional = false;
    var msjtx = '';
    let msAdd =  '';

    //Verifica si hay una lista
    var posmensaje = mensaje.search("LISTA_");
    if (posmensaje > -1){
        msjtx = transformarMensaje("lista",mensaje.substring(posmensaje+7),";");
        mensaje = mensaje.substring(0,posmensaje-1) + msjtx; 
    }

    //Verifica si hay un enlace
    posmensaje = mensaje.search("LINK_");
    if (posmensaje > -1){
        msjtx = transformarMensaje("link",mensaje.substring(posmensaje+6),",");
        mensaje = mensaje.substring(0,posmensaje-1) + msjtx; 
    }

    //Verifica si hay una imagen
    posmensaje = mensaje.search("IMAGE_");
    
    if (posmensaje > -1){
        msjtx = transformarMensaje("image",mensaje.substring(posmensaje+7));
        mensaje = mensaje.substring(0,posmensaje-1) + msjtx; 
    }


    posmensaje = mensaje.search("OPTION_");
    //Verifica si hay boton de opciones
    if (posmensaje > -1){
        adicional = true;
        msAdd =  mensaje.substring(posmensaje+8,mensaje.length-1);
        mensaje = mensaje.substring(0,posmensaje-2);
    }
    
    
    var html ='';        

    html += '<li>';
    html += '<div class="chat-img"><img src="assets/images/icons/jota_user.png" alt="user" /></div>';
    html += '<div class="chat-content">';
    html += '<div class="box bg-light-inverse">'+ mensaje+'</div></div>';
    html += '</li>';

 
    htmltemp = divChatbox.html() +html;

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