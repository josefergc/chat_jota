var btnSesion = $('#btnSesion');

let idSesion = "";



btnSesion.on('click', function(event){

    getSession();
    console.log(idSesion);

});


const getSession = async ()=> {
    
    const uri = 'http://localhost:3000/sesion';

    const response = await (await fetch(uri, {
        method:'GET',
        headers: { 'Content-Type': 'application/json'},
    })).json();

   idSesion = response.session_id;
}
 