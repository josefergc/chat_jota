const fs = require('fs');

const guardarLog = (mensaje) => {
    
    fs.appendFile('./server/log/filelog.txt', fechaActual() + " --- " + mensaje + "<br>" , (err) => {
        if (err) console.log(err);        
    });
}

const fechaActual = () => {
    var fecha = new Date();
    var year = fecha.getFullYear() + "-";
    var month = (fecha.getMonth() +1);
    if (month < 10) {month= '0' + month;}
    var day = (fecha.getDate());
    if (day < 10){day = "0" + day;}
    
    var hour = fecha.getHours();
    if (hour < 10){hour= "0" + hour;}
    
    var minuto = fecha.getMinutes();
    if (minuto < 10){minuto = "0" + minuto;}
   
    
    return year + month + "-" +day + " " + hour + ":" + minuto;
}



module.exports = { 
    guardarLog
}