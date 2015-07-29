var request = require('request');

var producer = require('godot-producer');

var CHECK_INTERVAL = 5 * 60000; //ms
var URL = 'http://www.brickflow.com';
var TIMEOUT = 20000; //ms brickflow.com has to respond within

var lastStatus = 'ok';

var checkServer = function(callback) {
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

var isServerUpByResponse = function(err, res){
  if(!err && res.statusCode === 200){
    return true;
  } else {
    return false;
  }
};

var watch = function(callback){
  checkServer(function(err, res){
    if(!isServerUpByResponse(err, res)){
      lastStatus = 'down';
    } else {
      lastStatus = 'ok';
    }
    callback();
  });
};

var goro200Producer = producer(
  function constructor(){
    //watch(function(){});
  },
  function produce(){
    var self = this;
    watch(function(){
      self.emit('data', {
        meta: { status: lastStatus }
      });
    });
  }
);

module.exports = goro200Producer;
