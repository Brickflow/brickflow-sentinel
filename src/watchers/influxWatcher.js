var influx = require('influx');

var self = {};

self.client = influx({
    host: 'raiden.brickflow.com',
    port: 8086,
    username: 'root',
    password: 'password',
    database: 'stats'
  });

self.check = function (checkCallback) {
  var pageView = 'SELECT count(message) ' +
                 'FROM page-view ' +
                 'WHERE time > now() - 1h ';

  var tumblrShareSuccess = 'SELECT count(message) ' +
                           'FROM tumblr-queue-success '+
                           'WHERE time > now() - 2h';

  var noReg = 'SELECT count(message) ' +
              'FROM register-success ' +
              'WHERE time > now() - 1h ';


  self.client.query(tumblrShareSuccess, function(err, res) {
    self.queryCallback(err, res, {type: 'noShare'}, checkCallback);
  });

  self.client.query(pageView, function(err, res) {
    self.queryCallback(err, res, {type: 'pageView'}, checkCallback);
  });

  self.client.query(noReg, function(err, res) {
    self.queryCallback(err, res, {type: 'noReg'}, checkCallback);
  });
};

self.queryCallback = function(err, res, data, checkCallback){
  if(res && res.length !== 0){
    console.log('[SENTINEL] No influx problem.');
    checkCallback({passes: true, type: data.type});
  } else {
    console.log('[SENTINEL] Influx has a problem.');
    checkCallback({passes: false, type: data.type});
  }
};

module.exports = self;
