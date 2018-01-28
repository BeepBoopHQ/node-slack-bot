let version = require('../version.js');

module.exports.commandBerto = function commandBerto(message, commandMsg) {
  return [{
    message: {
      text: '<@U2ASHP5FT> ayo berto :100:'
    }
  }];
}

module.exports.commandGoHawks = function commandGoHawks(message, commandMsg) {
  return [{
    message: {
      text: '#gohawks'
    }
  }];
}

module.exports.commandRussell = function commandRussell(message, commandMsg) {
  return [{
    message: {
      text: '`beep boop i am russell_bot`'
    }
  }];
}

module.exports.commandLit = function commandLit(message, commandMsg) {
  return [{
    message: {
      text: ':100::100::100::fire::fire::fire::champagne::champagne::champagne:'
    }
  }];
}

module.exports.commandExBert = function commandExbert(message, commandMsg) {

  if (!commandMsg) {
    return [{
      message: {
        text: 'use `!exbert <text>`'
      }
    }];

    return;
  }

  // lol
  return[{
    message: {
      text: `<@U2ASHP5FT>, <@${message.user}> needs an exbert: ${commandMsg}`
    }
  }];
}

module.exports.commandTrapHorns = function commandTrapHorns(message, commandMsg) {
  return [{
    message: {
      text: 'https://www.youtube.com/watch?v=Ip1SYl97kh4 :trumpet::trumpet::trumpet::trumpet:'
    }
  }];
}

module.exports.commandEscalate = function commandEscalate(message, commandMsg) {

  if (!commandMsg) {
    return [{
      message: {
        text: 'use `!escalate <text>`'
      }
    }];

    return;
  }

  let response = {
    message: {
      text: ''
    }
  };

  if (message.user !== "U2ARFPF62") {
    response.message.text = 'Thanks for your ticket, an associate will be with you shortly.';
  } else {
    response.message.text = `<@U2ASHP5FT> :fire::fire: [HIGH PRIORITY] :fire::fire: ${commandMsg} :fire::fire: [HIGH PRIORITY] :fire::fire:`;
  }

  return [response];
}

module.exports.commandBlessUp = function commandBlessUp(message, commandMsg) {
  return [{
    message: {
      text: 'bless up :djkhaled::key:'
    }
  }];
}

module.exports.commandVersion = function showVersion(message, commandMsg) {
  return [{
    message: {
      text: `russell_bot version: \`${version.version}\``
    }
  }];
}

module.exports.commandBug = function commandBug(message, commandMsg) {

  if (!commandMsg) {
    return [{
      message: {
        text: 'use `!bug <text>`'
      }
    }];
  }

  return [{
    message: {
      text: `<@${message.user}> has reported a bug: ${commandMsg}`,
      channel: 'C6LKZEHEE'
    }
  }, {
    message: {
      text: 'thanks for your bug report. you can find it in #bugreports'
    }
  }];
}

module.exports.commandFeature = function commandFeature(message, commandMsg) {

  if (!commandMsg) {
    return [{
      message: {
        text: 'use `!feature <text>`'
      }
    }];
  }

  return [{
    message: {
      text: `<@${message.user}> has requested a feature: ${commandMsg}`,
      channel: 'C2BRPHPS4'
    }
  }, {
    message: {
      text: 'thanks for your feature request. you can find it in #featurerequests'
    }
  }];
}

module.exports.commandCeleryMan = function commandCeleryMan(message, commandMsg) {
  // computer load up celery man
  return [{
    message: {
      text: '`Yes, Paul.`'
    }
  }, {
    message: {
      text: 'http://i.imgur.com/zSr6jEB.gif'
    }
  }];
}

module.exports.commandFlipCoin = function commandFlipCoin(message, commandMsg) {
  let replies = [];

  if (commandMsg) {
    const side = commandMsg.split(' ')[0];

    if(side.toLowerCase() !== 'heads' && side.toLowerCase() !== 'tails') {
      return [{
        message: {
          text: 'side must be `heads` or `tails`'
        }
      }];
    }

    const text = commandMsg.substr(commandMsg.indexOf(' ') + 1);

    if(!text) {
      return [{
        message: {
          text: 'can\'t leave the text blank'
        }
      }];
    }

    replies.push({
      message: {
        text: `<@${message.user}> is flipping a coin! if ${side} then <@${message.user}> ${text}`
      }
    })

    const flip = (Math.floor(Math.random() * (2 - 1 + 1)) + 1);

    if(flip === 1) {
      replies.push({
        message: {
          text: `It's *heads*! <@${message.user}> said: ${text}`
        }
      });
    } else {
      replies.push({
        message: {
          text: `It's *tails*! <@${message.user}> said: ${text}`
        }
      });
    }

    return replies;
  }

  return [{
    message: {
      text: `<@${message.user}> flipped a coin!`
    }
  }, {
    message: {
      text: ((Math.floor(Math.random() * (2 - 1 + 1)) + 1) === 1 ? 'It\'s Heads!' : 'It\'s Tails!')
    }
  }];
}

module.exports.commandChallengeAccepted = function commandChallengeAccepted(message, commandMsg) {
  const reply = {
    'username': 'Barney Stinson',
    'icon_url': 'https://pbs.twimg.com/profile_images/2925485686/23b6d30cdb4e3b6dca5ead7b351f06d1_400x400.jpeg',
    'attachments': [{
      'fallback': 'Challenge accepted.',
      'text': 'Challenge accepted.',
      'image_url' : 'https://i.pinimg.com/736x/5a/c8/80/5ac880fa35b1e9648fcbd4623d25905c--himym-challenge-accepted.jpg'
    }]
  };

  return [{
      message: {
          text: reply
      }
  }];
}

module.exports.commandLGRW = function commandLGRW(message, commandMsg) {
  const reply = {
    'username': 'Al the Octopus',
    'icon_url': 'https://i.pinimg.com/originals/75/74/15/75741576dd2224c66ed8a66489bdf487.jpg',
    'text': '#LGRW'
  };

  return [{
      message: {
          text: reply
      }
  }];
}