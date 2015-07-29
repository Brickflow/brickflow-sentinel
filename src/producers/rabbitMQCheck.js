var producer = require('godot-producer');
var ssh2 = require('ssh2');

var lastStatus = 'ok';

function check(callback){
  var connection = new ssh2();
  var stringBuffer = '';
  connection.on('ready', function(){
    connection.exec('sudo service rabbitmq-server status', function(err, stream){
      if(err) {
        lastStatus = 'down';
        return callback();
      }
      stream.on('data', function(data){
        stringBuffer += data.toString();
      }).on('close', function(){
        if(isResponsive(stringBuffer)){
          lastStatus = 'ok';
        } else {
          lastStatus = 'down';
        }
        connection.end();
        return callback();
      });
    });
  }).connect({
    host: 'kitana.brickflow.com',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').
        readFileSync(__dirname + '/../../brickflow_key.pem')
  });
}

function isResponsive(str){
  var status = {
    memoryLimit: parseInt(str.match(/vm_memory_limit,\s?[0-9+]+/)[0].split(',')[1]),
    memory: parseInt(str.match(/total,\s?[0-9+]+/)[0].split(',')[1]),
    diskFreeLimit: parseInt(str.match(/disk_free_limit,\s?[0-9+]+/)[0].split(',')[1]),
    diskFree: parseInt(str.match(/disk_free,\s?[0-9+]+/)[0].split(',')[1]),
    fileDescriptorLimit: parseInt(str.match(/total_limit,\s?[0-9+]+/)[0].split(',')[1]),
    fileDescriptor: parseInt(str.match(/total_used,\s?[0-9+]+/)[0].split(',')[1]),
    socketLimit: parseInt(str.match(/sockets_limit,\s?[0-9+]+/)[0].split(',')[1]),
    socket: parseInt(str.match(/sockets_used,\s?[0-9+]+/)[0].split(',')[1])
  };

  return (status.memory < status.memoryLimit &&
          status.diskFree > status.diskFreeLimit &&
          status.fileDescriptor < status.fileDescriptorLimit &&
          status.socket < status.socketLimit);
}


var rabbitMQCheckProducer = producer(
  function constructor(){
    //watch(function(){});
  },
  function produce(){
    var self = this;
    check(function(){
      self.emit('data', {
        meta: { status: lastStatus }
      });
    });
  }
);

module.exports = rabbitMQCheckProducer;
