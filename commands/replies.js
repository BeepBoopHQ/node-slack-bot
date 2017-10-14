var version = require('../version.js');

var exports = module.exports = {};

exports.commandBerto = function commandBerto(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: '<@U2ASHP5FT> ayo berto :100:'
    }
  }]);
}

exports.commandGoHawks = function commandGoHawks(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: '#gohawks'
    }
  }]);
}

exports.commandRussell = function commandRussell(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: '`beep boop i am russell_bot`'
    }
  }]);
}

exports.commandLit = function commandLit(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: ':100::100::100::fire::fire::fire::champagne::champagne::champagne:'
    }
  }]);
}

exports.commandExBert = function commandExbert(message, commandMsg, cb) {

  if (!commandMsg) {
    cb([{
      method: 'reply',
      message: {
        text: 'use `!exbert <text>`'
      }
    }]);

    return;
  }

  // lol
  cb([{
    method: 'reply',
    message: {
      text: `<@U2ASHP5FT>, <@${message.user}> needs an exbert: ${commandMsg}`
    }
  }]);
}

exports.commandTrapHorns = function commandTrapHorns(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: 'https://www.youtube.com/watch?v=Ip1SYl97kh4 :trumpet::trumpet::trumpet::trumpet:'
    }
  }]);
}

exports.commandEscalate = function commandEscalate(message, commandMsg, cb) {

  if (!commandMsg) {
    cb([{
      method: 'reply',
      message: {
        text: 'use `!escalate <text>`'
      }
    }]);

    return;
  }

  var response = {
    method: 'reply',
    message: {
      text: ''
    }
  };

  if (message.user !== "U2ARFPF62") {
    response.message.text = 'Thanks for your ticket, an associate will be with you shortly.';
  } else {
    response.message.text = `<@U2ASHP5FT> :fire::fire: [HIGH PRIORITY] :fire::fire: ${commandMsg} :fire::fire: [HIGH PRIORITY] :fire::fire:`;
  }

  cb([response]);
}

exports.commandBlessUp = function commandBlessUp(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: 'bless up :djkhaled::key:'
    }
  }]);
}

exports.commandVersion = function showVersion(message, commandMsg, cb) {
  cb([{
    method: 'reply',
    message: {
      text: `russell_bot version: \`${version.version}\``
    }
  }]);
}

exports.commandBug = function commandBug(message, commandMsg, cb) {

  if (!commandMsg) {
    cb([{
      method: 'reply',
      message: {
        text: 'use `!bug <text>`'
      }
    }]);

    return;
  }

  cb([{
    method: 'say',
    message: {
      text: `<@${message.user}> has reported a bug: ${commandMsg}`,
      channel: 'C6LKZEHEE'
    }
  }, {
    method: 'reply',
    message: {
      text: 'thanks for your bug report. you can find it in #bugreports'
    }
  }]);
}

exports.commandFeature = function commandFeature(message, commandMsg, cb) {

  if (!commandMsg) {
    cb([{
      method: 'reply',
      message: {
        text: 'use `!feature <text>`'
      }
    }]);

    return;
  }

  cb([{
    method: 'say',
    message: {
      text: `<@${message.user}> has requested a feature: ${commandMsg}`,
      channel: 'C2BRPHPS4'
    }
  }, {
    method: 'reply',
    message: {
      text: 'thanks for your feature request. you can find it in #featurerequests'
    }
  }]);
}

exports.commandCeleryMan = function commandCeleryMan(message, commandMsg, cb) {
  // computer load up celery man
  cb([{
    method: 'convo',
    message: {
      conversation: [
        '`Yes, Paul.`',
        'http://i.imgur.com/zSr6jEB.gif'
      ]
    }
  }]);
}

exports.commandFlipCoin = function commandFlipCoin(message, commandMsg, cb) {
  var replies = [];

  if (commandMsg) {
    var side = commandMsg.split(' ')[0];

    if(side.toLowerCase() !== 'heads' && side.toLowerCase() !== 'tails') {
      cb([{
        method: 'reply',
        message: {
          text: 'side must be `heads` or `tails`'
        }
      }]);
      return;
    }

    var text = commandMsg.substr(commandMsg.indexOf(' ') + 1);

    if(!text) {
      cb([{
        method: 'reply',
        message: {
          text: 'can\'t leave the text blank'
        }
      }]);
      return;
    }

    replies.push({
      method: 'reply',
      message: {
        text: `<@${message.user}> is flipping a coin! if ${side} then <@${message.user}> ${text}`
      }
    })

    var flip = (Math.floor(Math.random() * (2 - 1 + 1)) + 1);

    if(flip === 1) {
      replies.push({
        method: 'reply',
        message: {
          text: `It's *heads*! <@${message.user}> said: ${text}`
        }
      });
    } else {
      replies.push({
        method: 'reply',
        message: {
          text: `It's *tails*! <@${message.user}> said: ${text}`
        }
      });
    }

    cb(replies);
    return;
  }

  cb([{
    method: 'reply',
    message: {
      text: `<@${message.user}> flipped a coin!`
    }
  }, {
    method: 'reply',
    message: {
      text: ((Math.floor(Math.random() * (2 - 1 + 1)) + 1) === 1 ? 'It\'s Heads!' : 'It\'s Tails!')
    }
  }]);
}

exports.commandChallengeAccepted = function commandChallengeAccepted(message, commandMsg, cb) {
  var reply = {
    'username': 'Barney Stinson',
    'icon_url': 'https://pbs.twimg.com/profile_images/2925485686/23b6d30cdb4e3b6dca5ead7b351f06d1_400x400.jpeg',
    'attachments': [{
      'fallback': 'Challenge accepted.',
      'text': 'Challenge accepted.',
      'image_url' : 'https://i.pinimg.com/736x/5a/c8/80/5ac880fa35b1e9648fcbd4623d25905c--himym-challenge-accepted.jpg'
    }]
  };

  cb([{
      method: 'reply',
      message: {
          text: reply
      }
  }]);
}

exports.commandLGRW = function commandLGRW(message, commandMsg, cb) {
  var reply = {
    'username': 'Al the Octopus',
    'icon_url': 'https://i.pinimg.com/originals/75/74/15/75741576dd2224c66ed8a66489bdf487.jpg',
    'text': '#LGRW'
  };

  cb([{
      method: 'reply',
      message: {
          text: reply
      }
  }]);
}