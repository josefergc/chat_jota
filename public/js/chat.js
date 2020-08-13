var params = new URLSearchParams(window.location.search);
var usuario;
let idSesion = "";
let urlchat = "";
let urlimage = "";
var sesiontmp = "";
const urlvar = "https://jota-chat.herokuapp.com";



var mensajeUsuario = "";


var mensajeError = 'Lamento no poder ayudarte en este momento, para comunicarte con un agente de servicio puedes ir al siguiente enlace &LINK_["mesadeservicio",link]';
 



if (sessionStorage.getItem("sesion")){

    idSesion = sessionStorage.getItem("sesion");
    usuario = {
        nombre: sessionStorage.getItem("nombre"),
        email: sessionStorage.getItem("email"),
        telefono: sessionStorage.getItem("telefono")
    }

}
else{

    if (!params.has('nombre') || !params.has('email') || !params.has('telefono')) {
        window.location = 'index.html';
        throw new Error('Todos los campos son necesarios');
    }

    usuario = {
        nombre: params.get('nombre'),
        email: params.get('email'),
        telefono: params.get('telefono')
    }
    sessionStorage.setItem('nombre',usuario.nombre);
    sessionStorage.setItem('email',usuario.email);
    sessionStorage.setItem('telefono',usuario.telefono); 
    sesiontmp = getSession();

}





var saludo = '';
var respuesta = [];
var htmltemp = '';
let numImagen = 0;
let imagedir = urlimage;
//'https://jota-chat.s3.amazonaws.com/';
var vezSinResponder = 0;

async function getSession()  {
    try{
        const uri = urlvar + '/sesion' ;
        //const uri = 'https://jota-chat.herokuapp.com/sesion';
        //const uri = 'http://localhost:3000/sesion';

        const response = await (await fetch(uri, {
            method:'GET',
            headers: { 'Content-Type': 'application/json'},
        })).json();
        
        if (response.code === 400) {
            renderJota(mensajeError);
            scrollBottom();
            return;
        }
        idSesion = response.session_id;
        urlchat = response.url_chat;
        urlimage = response.url_image;

        sessionStorage.setItem('sesion',idSesion);
        console.log(urlchat);
        console.log(urlimage);
        console.log(idSesion);
        return idSesion; 
    
    }catch(err){
        console.log(err);
        renderJota(mensajeError);
        scrollBottom();    
    }
}

async function getrespuesta (numsesion,mensaje) {
    
    try{
        const uri = urlvar + '/respuesta';
        //const uri = 'https://jota-chat.herokuapp.com/respuesta';
        
        const response = await (await fetch(uri, {
            method:'GET',
            headers: { 'Content-Type': 'application/json',
                        'sesion': numsesion,
                        'mensaje': mensaje,
                        'usuario':usuario.nombre,
                        'email': usuario.email  
            }
        })).json();

        return response;
    }catch(err){
        console.log(err);
    }
}


//referencias de jQuery
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var btnMensaje = $('#btnMensaje');
var modalImagen= $('#modalImagen');
var imgCanvas= $('#imgCanvas');


function resizeHeight(){
    var vpw = $(window).height();
    divChatbox.css('height', vpw/1.3);
}

resizeHeight();

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
            
            if (itemList[0].search("mesadeservicio")>-1)
                html += '<a href="' + urlchat + 'Nm=' + usuario.nombre + '&Cr='+ usuario.email+ '&Tp='+ usuario.telefono+ '&As='+ mensajeUsuario+ '" target="_blank">Mesa de servicio</a>';
            else
            {
                html += '<a href='+itemList[0] + ' ';
                if (itemList[1].substring(1,4)=== 'img')
                    html += '><img src="/assets/images/icons/'+itemList[1].substring(5,itemList[1].length-1)+ '"></a>';
                else
                    html += 'target="_blank">'+itemList[1].substring(5,itemList[1].length-1)+'</a>';
            }
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

    

    //Verifica si hay un enlace
    posmensaje = mensaje.search("LINK_");
    if (posmensaje > -1){
        msjtx = transformarMensaje("link",mensaje.substring(posmensaje+6),",");
        mensaje = mensaje.substring(0,posmensaje-1) + msjtx; 
    }

    //Verifica si hay una lista
    var posmensaje = mensaje.search("LISTA_");
    if (posmensaje > -1){
        msjtx = transformarMensaje("lista",mensaje.substring(posmensaje+7),";");
        mensaje = mensaje.substring(0,posmensaje-1) + msjtx; 
    }

    //Verifica si hay una imagen
    posmensaje = mensaje.search("IMAGE_");
    
    if (posmensaje > -1){
        msjtx = transformarMensaje("image",mensaje.substring(posmensaje+7));
        mensaje = mensaje.substring(0,posmensaje-1) + msjtx; 
        setTimeout(function(){
            scrollBottom();
        },3000);
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
        
        var answer = "";
        //Disculpa, no he entendido tu solicitud, puedes reformular tu pregunta por favor";
        //o si lo prefieres, da clic en el siguiente link donde uno de los asesores de la mesa de servicio
        // de CCE te ayudar'a mientras aprendo acerca del tema
        if (idSesion.length === 0){
            vezSinResponder++;
            if (vezSinResponder === 3){
                renderJota(mensajeError);
                scrollBottom();
                return;
            }
            txtMensaje.prop('disabled',false);
            btnMensaje.prop('disabled',false);
            txtMensaje.val('').focus();
            return;
        }
        
        vezSinResponder=0;

        let responder = await getrespuesta(idSesion,mensaje);
        
        if (responder.status===200)
        {
            if (responder.result.output.generic[0])
                answer = responder.result.output.generic[0].text;
            if (answer.length>0)
            {
                renderJota(answer);
                scrollBottom();
            } 
            else
            {
                txtMensaje.prop('disabled',false);
                btnMensaje.prop('disabled',false);
                txtMensaje.val('').focus();
            }

        }
        //si pierda la sesion se debe volver a conectar
        else if (responder.err.code === 404)
        {
            sesiontmp = await getSession();
            responder = await getrespuesta(sesiontmp,mensaje);
            if (responder.result.output.generic[0])
                answer = responder.result.output.generic[0].text;  
            if (answer.length>0)
            {
                renderJota(answer);
                scrollBottom();
            }
            else
            {
                txtMensaje.prop('disabled',false);
                btnMensaje.prop('disabled',false);
                txtMensaje.val('').focus();
            }
        }
        else{
            renderJota(mensajeError);
            scrollBottom(); 
            console.log(responder.status);
            console.log(responder.err.code);   
        }

    }catch(e){
        console.log(e);
        renderJota(mensajeError);
        scrollBottom();    
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

    let mensaje = txtMensaje.val();
    mensajeUsuario = mensaje;
    event.preventDefault();

    if (mensaje.length === 0) {
        return;
    }
        
    renderMensaje(mensaje);
    txtMensaje.prop('disabled',true);
    btnMensaje.prop('disabled',true);
    scrollBottom();
     
    if (idSesion.length === 0) {
        var fecha = new Date();
        setTimeout(function(){
            responderJota(mensaje);
        },5000);
    }
    else{
        responderJota(mensaje)
            .then(console.log)
            .catch(console.log);
    }

    txtMensaje.val('').focus();
        
});