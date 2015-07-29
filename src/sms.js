var Nexmo = require('simple-nexmo');
var nexmo = new Nexmo();
var _ = require('lodash');
var KEY = 'key';
var SECRET = 'secret';
var OWNNUMBER = 'number';
var SMS = {};
var debug = false;

var guys = [
  { name: 'Marci' , number: 'number' },
  { name: 'Tojas' , number: 'number' },
  { name: 'David' , number: 'number' },
  { name: 'Laci' , number: 'number' }
];

SMS.initialize = function(key, secret){
  nexmo.init(key, secret);
};

SMS.constructAndSend = function(err, res){
  _(guys).each(function(guy){
    if(debug){
      console.log(OWNNUMBER,
          guy.number,
          SMS.construct(guy.name, err, res),
          SMS.handleResponse);
    } else {
      nexmo.sendTextMessage(OWNNUMBER,
          guy.number,
          SMS.construct(guy.name, err, res),
          SMS.handleResponse);
    }
  });
};

SMS.sendToAll = function (message){
  _(guys).each(function(guy){
    if(debug){
      console.log(OWNNUMBER,
          guy.number,
          message,
          SMS.handleResponse);
    } else {
      nexmo.sendTextMessage(OWNNUMBER,
          guy.number,
          message,
          SMS.handleResponse);
    }
  });
};

SMS.handleResponse = function(err, res){
  console.log('[SENTINEL] Message sent.');
};

SMS.sendFixed = function(){
  SMS.sendToAll('Calm down, the server is fixed! :)');
};

SMS.sendInflux = function(data) {
  switch(data.type){
    case 'pageView':
      SMS.sendToAll('Server problem: There are no page-view events in the last 1 hour.');
      break;
    case 'noShare':
      SMS.sendToAll('Server problem: There are no tumblr-share-success events in the last 2 hours.');
      break;
    case 'noReg':
      SMS.sendToAll('Server problem: There are no registration events in the last 1 hour.');
      break;
  }
};

SMS.construct = function(name, err, res){
  var message = 'Server is down, ' + name + '!';
  if(err){
    message += 'ErrorCode: ' + err.code + '. ';
  } else {
    message += 'ResponseCode:' + res.statusCode + '. ';
  }
  message += 'Send RS passw to restart. Good luck SpaceCowboy!';
  return message;
};

SMS.initialize(KEY, SECRET, 'http', false);
module.exports = SMS;
