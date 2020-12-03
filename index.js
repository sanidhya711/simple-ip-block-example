const express = require("express");
const app = express();
var ips = [];
var blockedips = [];
setInterval(() => {
    ips.forEach(function(IP){
        IP.times=0;
    })
},60000);

app.get("/",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
    var alreadyRegistered = false;

    ips.forEach(function(IP){
        if(IP.ip==ip){
            alreadyRegistered=true;
        }
    });

    if(alreadyRegistered){
        ips.forEach(function(element){
            if(element.ip==ip){
                element.times++;
                if(element.times>10){
                    blockedips.push(ip);
                    unblockipafter1minute(ip);
                }
            }
        });
    }else{
        ips.push({ip:ip,times:1});
    }

    if(blockedips.includes(ip)){
        res.redirect("/blockedip");
    }
    else{
        res.sendStatus(200);
    }
});

app.get("/blockedip",function(req,res){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
    if(blockedips.includes(ip)){
        res.send("ur ip has been blocked since u have loaded this site more than 10 times inna minute <br/> cooldown = 1 minute");
    }
    else{
        res.redirect("/");
    }
});

function unblockipafter1minute(ip){
    setTimeout(() => {
        var index = blockedips.indexOf(ip);
        blockedips.splice(index,1);
        resetnooftimes(ip);
    },60000);
}

function resetnooftimes(ip){
    ips.forEach(function(IP){
        if(IP.ip==ip){
            IP.times=0;
        }
    });
}

app.listen(process.env.PORT || 3000);