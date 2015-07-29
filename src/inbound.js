var http = require('http');
var url = require('url');
var brickflowSSH = require('./brickflowSSH');

var PORT = 1337;
var PASSWORD = 'dogecoin';
var RESTART_TIME_WINDOW = 60000; // this many time (ms) must pass between
                                 // two server restarts
var inbound = {};
var lastRestartQuery = new Date(new Date().getTime() -
                                RESTART_TIME_WINDOW);
var deployCallback = null;

inbound.bindDeployCallback = function(callback){
  deployCallback = callback;
};

inbound.fetchMessage = function(queryObject){
  if(queryObject.text){
    console.log("[SENTINEL] Incoming Query!")
    if(queryObject.text.toLowerCase().indexOf('rs') == 0 &&
       queryObject.text.toLowerCase().indexOf(PASSWORD) !== -1){
      inbound.restartServer();
    } else if(queryObject.text === "DEPLOY_START"){
      deployCallback({status: 'start'});
    } else if(queryObject.text === "DEPLOY_FINISH"){
      deployCallback({status: 'finish'});
    } else {
      console.log('[SENTINEL] Cannot fetch the message.');
    }
  }
};

inbound.restartServer = function(){
  if(lastRestartQuery.getTime() + RESTART_TIME_WINDOW <
     new Date().getTime()){
    lastRestartQuery = new Date();
    console.log("[SENTINEL] Restarting server.");
    brickflowSSH.restartServer();
  } else {
    console.log("[SENTINEL] Cannot restart yet.");
  }
};

inbound.startServer = function(port){
  http.createServer(function (req, res){
    var parsedUrl = url.parse(req.url, true);
    var queryObject = parsedUrl.query;

    inbound.fetchMessage(queryObject);

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end();
  }).listen(PORT);
};

inbound.startServer(PORT);
module.exports = inbound;