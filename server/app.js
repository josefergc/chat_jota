const watson = require('./watson/watson');

const conversacion = async() => {

    try{
      const idsesion = await watson.getSesion();
      const respuesta = watson.getrespuesta(idsesion)
      return `la id de sesion es ${idsesion}`
    }catch(e){
      return `No se pudo crear la sesion`
    }
}

conversacion()
  .then(console.log)
  .catch(console.log)

