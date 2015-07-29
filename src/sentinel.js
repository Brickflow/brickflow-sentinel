var request = require('request');
var SMS = require('./sms');
var email = require('./email');
var inbound = require('./inbound');
var influxWatcher = require('./watchers/influxWatcher');

var CHECK_INTERVAL = 5 * 60000; //ms
var URL = 'http://www.brickflow.com';
var TIMEOUT = 60000; //ms brickflow.com has to respond within
var DEPLOY_TIMEOUT = 4 * 60000;
var EXPLICIT_CHECK_TIMEOUT = 20000; //wait this many ms
                                    //before explicitly checking
                                    //after deploy
var sentinel = {};

sentinel.status = 'watching';
sentinel.deployTimeout = null; //the actual setTimeout reference

sentinel.checkServer = function(callback) {
  this.options = {
    url: URL,
    headers: {
      'User-Agent': 'Sentinel'
    },
    timeout: TIMEOUT
  };

  request(this.options, function(err, res, body){
    callback(err, res);
  });
};

sentinel.isServerUpByResponse = function(err, res){
  if(!err && res.statusCode === 200){
    return true;
  } else {
    return false;
  }
};

sentinel.watch = function(){
  sentinel.checkServer(function(err, res){
    if(!sentinel.isServerUpByResponse(err, res)){
      if(sentinel.status === 'watching'){
        console.log('[SENTINEL] Server is down.');
        SMS.constructAndSend(err, res);
        sentinel.status = 'waitingForFix';
      } else if(sentinel.status === 'deploying') {
        console.log('[SENTINEL] Server is down due to deploying.');
      }
    } else {
      if(sentinel.status === 'waitingForFix'){
        console.log('[SENTINEL] Server is fixed.');
        SMS.sendFixed();
        sentinel.status = 'watching';
      } else if(sentinel.status === 'deployerror'){
        console.log('[SENTINEL] Deploy error fixed.');
        email.sendDeployFix();
        sentinel.status = 'watching';
      }
    }
  });
};

sentinel.watchInflux = function() {
  influxWatcher.check(function(data) {
    if(!data.passes){
      SMS.sendInflux({type:data.type});
    }
  });
};

sentinel.startWatching = function() {
  console.log('[SENTINEL] Started watching.');
  sentinel.checkLoop = setInterval(
      function(){
        sentinel.watch();
      },
      CHECK_INTERVAL
  );
  sentinel.influxCheckLoop = setInterval(
    sentinel.watchInflux, 30*60*1000
  );
};

sentinel.deployStart = function() {
  console.log('[SENTINEL] Deploying in progress.');
  sentinel.status = 'deploying';
  sentinel.deployTimeout = setTimeout(function(){
    console.log('[SENTINEL] Deploy time exceeded. Sending email.');
    sentinel.status = 'deployerror';
    email.sendDeployError();
  }, DEPLOY_TIMEOUT);
};

sentinel.deployFinish = function() {
  console.log('[SENTINEL] Deploying finished. Now watching.');
  sentinel.status = 'watching';
  clearTimeout(sentinel.deployTimeout);
  setTimeout(sentinel.watch, EXPLICIT_CHECK_TIMEOUT); //check explicitly after deploying finished
};

sentinel.deployCallback = function (options){
  if(options.status === 'start'){
    sentinel.deployStart();
  } else if(options.status === 'finish'){
    sentinel.deployFinish();
  }
};

inbound.bindDeployCallback(sentinel.deployCallback);

module.exports = sentinel;
