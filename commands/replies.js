var version = require('../version.js');

var exports = module.exports = {};

exports.commandBerto = function commandBerto(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: '<@U2ASHP5FT> ayo berto :100:'
    }
    }];
}

exports.commandGoHawks = function commandGoHawks(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: '#gohawks'
    }
  }];
}

exports.commandRussell = function commandRussell(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: '`beep boop i am russell_bot'
    }
  }];
}

exports.commandLit = function commandLit(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: ':100::100::100::fire::fire::fire::champagne::champagne::champagne:'
    }
  }];
}

exports.commandExBert = function commandExbert(message, commandMsg) {
  // lol
  return [{
    method: 'reply',
    message: {
      text: `<@U2ASHP5FT>, <@${message.user}> needs an exbert: ${commandMsg}`
    }
  }];
}

exports.commandTrapHorns = function commandTrapHorns(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: 'https://www.youtube.com/watch?v=Ip1SYl97kh4 :trumpet::trumpet::trumpet::trumpet:'
    }
  }];
}

exports.commandEscalate = function commandEscalate(message, commandMsg) {
  var response = {
    method: 'reply',
    message: {
      text: ''
    }
  };

  if (message.user !== "U2ARFPF62") {
    response.message.text = 'Thanks for your ticket, an associate will be with you shortly.';
  } else {
    response.message.text `<@U2ASHP5FT> :fire::fire: [HIGH PRIORITY] :fire::fire: ${commandMsg} :fire::fire: [HIGH PRIORITY] :fire::fire:`;
  }

  return [response];
}

exports.commandBlessUp = function commandBlessUp(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: 'bless up :djkhaled::key:'
    }
  }];
}

exports.commandVersion = function showVersion(message, commandMsg) {
  return [{
    method: 'reply',
    message: {
      text: `russell_bot version: \`${version.version}\``
    }
  }];
}