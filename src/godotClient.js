var godot = require('godot');
var goro200 = require('./producers/goro200');
var cyraxCheck = require('./producers/cyraxCheck');
var rabbitMQCheck = require('./producers/rabbitMQCheck');

godot.createClient({
  type: 'tcp',
  producers: [
    goro200({
      host: '54.235.69.70',
      service: 'goro200/heartbeat',
      ttl: 1000 * 60
    }),
    cyraxCheck({
      host: '54.235.69.70',
      service: 'cyraxCheck/heartbeat',
      ttl: 1000 * 60
    }),
    rabbitMQCheck({
      host: '54.235.69.70',
      service: 'rabbitMQCheck/heartbeat',
      ttl: 1000 * 60
    })
  ]
}).connect(1337);
