var Connection = require('ssh2');
var brickflowSSH = {};
var debug = false;
var pathCommand = 'cd /home/ubuntu/brickflow_app/scripts && ls';
var restartCommand = debug ? 'uptime' : './restartServer.sh';

brickflowSSH.runCommand = function(connection, callback){
  connection.exec(pathCommand + '&&' + restartCommand,
    function(err, stream){
      if (err) throw err;
      stream.on('data', function(data){
        console.log('[BRICKFLOWSSH] STDOUT:' + data);
      }).on('close', function(){
        callback(connection);
      });
    }
  );
};

brickflowSSH.closeConnection = function(connection){
  connection.end();
};

brickflowSSH.restartServer = function(){
  var tempConnection = new Connection();

  tempConnection.on('ready', function() {

    console.log('[BRICKFLOWSSH] Connected!');
    brickflowSSH.runCommand(tempConnection, brickflowSSH.closeConnection);
  
  });

  tempConnection.on('close', function(had_error) {
    console.log('[BRICKFLOWSSH] Disconnected!');
  });

  tempConnection.connect({
    host: 'brickflow.com',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync(__dirname + '/../brickflow_key.pem')
  });

};

module.exports = brickflowSSH;