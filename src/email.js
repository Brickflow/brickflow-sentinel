var nodemailer = require('nodemailer');
var email = {};
var transport = null;

email.createTransport = function() {
  transport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
      user: 'marcell.ban@brickflow.com',
      pass: '454593iadbz'
    }
  });
};

var errorMessage = {
  from: 'SENTINEL<marcell.ban@brickflow.com>',
  to: 'dev@brickflow.com',
  subject: 'Deploy timeout',
  html:'<p><b>Hey bitches!</b></p>' +
       '<p>The last deploy exceeded its time limit. Check it please!</p>' +
       '<p><i>Best regards, Sentinel.</i></p>'
};

var fixMessage = {
  from: 'SENTINEL<marcell.ban@brickflow.com>',
  to: 'dev@brickflow.com',
  subject: 'Deploy fixed',
  html:'<p><b>Hey bitches!</b></p>' +
       '<p>Deployed build is fixed now!</p>' +
       '<p><i>Best regards, Sentinel.</i></p>'
};

email.sendDeployError = function () {
  email.createTransport();
  transport.sendMail(errorMessage, function (err, res) {
    if(err){
      console.log('[SENTINEL] Couldn\'t send email.');
    }else{
      console.log('[SENTINEL] Email successfully sent.');
    }
    transport.close();
  });
};

email.sendDeployFix = function () {
  email.createTransport();
  transport.sendMail(fixMessage, function (err, res) {
    if(err){
      console.log('[SENTINEL] Couldn\'t send email.');
    }else{
      console.log('[SENTINEL] Email successfully sent.');
    }
    transport.close();
  });
};


module.exports = email;