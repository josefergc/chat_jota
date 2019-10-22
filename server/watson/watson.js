

const getSesion = async() => {
    const valor = await assistant.createSession({
        assistantId: '15363595-53f2-4883-9533-a24676e30e6d'
    })
    .then(res => {
        console.log(res.result);
        return res.result.session_id; 
    })
    .catch(err => {
        console.log(err);
        return "err";
    });
    return  valor;
}

const getrespuesta = async(numsesion) => {
    console.log(numsesion);
    const valor = await assistant.message({
        assistantId: '15363595-53f2-4883-9533-a24676e30e6d',
        sessionId: numsesion,
        input:{
            'message_type' : 'text',
            'text': 'No sabes nada Jota'
        }
    })
    .then(res => {
      console.log(JSON.stringify(res, null,2));
      return "valor";
    })
    .catch(err => {
      console.log(err);
      return "error";
    });

    return valor;
}


module.exports = {  
    getSesion,
    getrespuesta
}

