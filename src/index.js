//var sentinel = require('./sentinel');

//sentinel.startWatching();

var godotClient = require('./godotClient');

process.on('uncaughtException', function (err) {
    console.log(err, err.stack);
});
