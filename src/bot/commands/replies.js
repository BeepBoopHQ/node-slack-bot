let version = require('../../version');
let dbUtils = require('../util/db/dbUtils');

module.exports.commandBerto = (message, commandMsg) => {
  return [{
    message: {
      text: '<@U2ASHP5FT> ayo berto :100:'
    }
  }];
};

module.exports.commandGoHawks = (message, commandMsg) => {
  return [{
    message: {
      text: '#gohawks'
    }
  }];
};

module.exports.commandRussell = (message, commandMsg) => {
  return [{
    message: {
      text: '`beep boop i am russell_bot`'
    }
  }];
};

module.exports.commandLit = (message, commandMsg) => {
  return [{
    message: {
      text: ':100::100::100::fire::fire::fire::champagne::champagne::champagne:'
    }
  }];
};

module.exports.commandExBert = (message, commandMsg) => {
  if (!commandMsg) {
    return [{
      message: {
        text: 'use `!exbert <text>`'
      }
    }];
  }

  // lol
  return [{
    message: {
      text: `<@U2ASHP5FT>, <@${message.user}> needs an exbert: ${commandMsg}`
    }
  }];
};

module.exports.commandTrapHorns = (message, commandMsg) => {
  return [{
    message: {
      text: 'https://www.youtube.com/watch?v=Ip1SYl97kh4 :trumpet::trumpet::trumpet::trumpet:'
    }
  }];
};

module.exports.commandEscalate = (message, commandMsg) => {
  if (!commandMsg) {
    return [{
      message: {
        text: 'use `!escalate <text>`'
      }
    }];
  }

  let response = {
    message: {
      text: ''
    }
  };

  if (message.user !== 'U2ARFPF62') {
    response.message.text = 'Thanks for your ticket, an associate will be with you shortly.';
  } else {
    response.message.text = `<@U2ASHP5FT> :fire::fire: [HIGH PRIORITY] :fire::fire: ${commandMsg} :fire::fire: [HIGH PRIORITY] :fire::fire:`;
  }

  return [response];
};

module.exports.commandBlessUp = (message, commandMsg) => {
  return [{
    message: {
      text: 'bless up :djkhaled::key:'
    }
  }];
};

module.exports.commandVersion = (message, commandMsg) => {
  return [{
    message: {
      text: `russell_bot version: \`${version.version}\``
    }
  }];
};

module.exports.commandBug = (message, commandMsg) => {
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
      channel: 'C2ARE3TQU'
    }
  }, {
    message: {
      text: 'thanks for your bug report. you can find it in #fantasybot'
    }
  }];
};

module.exports.commandFeature = (message, commandMsg) => {
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
      channel: 'C2ARE3TQU'
    }
  }, {
    message: {
      text: 'thanks for your feature request. you can find it in #fantasybot'
    }
  }];
};

module.exports.commandCeleryMan = (message, commandMsg) => {
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
};

module.exports.commandFlipCoin = (message, commandMsg) => {
  let replies = [];

  if (commandMsg) {
    const side = commandMsg.split(' ')[0];

    if (side.toLowerCase() !== 'heads' && side.toLowerCase() !== 'tails') {
      return [{
        message: {
          text: 'side must be `heads` or `tails`'
        }
      }];
    }

    const text = commandMsg.substr(commandMsg.indexOf(' ') + 1);

    if (!text) {
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
    });

    const flip = (Math.floor(Math.random() * (2 - 1 + 1)) + 1);

    if (flip === 1) {
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
};

module.exports.commandChallengeAccepted = (message, commandMsg) => {
  const reply = {
    'username': 'Barney Stinson',
    'icon_url': 'https://pbs.twimg.com/profile_images/2925485686/23b6d30cdb4e3b6dca5ead7b351f06d1_400x400.jpeg',
    'attachments': [{
      'fallback': 'Challenge accepted.',
      'text': 'Challenge accepted.',
      'image_url': 'https://i.pinimg.com/736x/5a/c8/80/5ac880fa35b1e9648fcbd4623d25905c--himym-challenge-accepted.jpg'
    }]
  };

  return [{
    type: 'custom',
    message: reply
  }];
};

module.exports.commandLGRW = (message, commandMsg) => {
  const reply = {
    'username': 'Al the Octopus',
    'icon_url': 'https://i.pinimg.com/originals/75/74/15/75741576dd2224c66ed8a66489bdf487.jpg',
    'text': '#LGRW'
  };

  return [{
    type: 'custom',
    message: reply
  }];
};

module.exports.commandHypeBeast = (message, commandMsg) => {
  return [{
    message: {
      text: ':supreme-s::supreme-u::supreme-p::supreme-r::supreme-e1::supreme-m::supreme-e2:'
    }
  }];
};

module.exports.commandGoMs = (message, commandMsg) => {
  const reply = {
    'username': 'Mariner Moose',
    'icon_url': 'https://thumbs.dreamstime.com/b/mariners-moose-mascot-15502634.jpg',
    'attachments': [{
      'fallback': '#GOMS',
      'text': '#GOMS',
      'image_url': 'https://thumbs.gfycat.com/ObviousViciousGopher-max-1mb.gif'
    }]
  };

  return [{
    type: 'custom',
    message: reply
  }];
};

module.exports.commandTestDbPoll = (message, commandMsg) => {
  dbUtils.startPoll('foo', 'channel', () => {
    console.log('in callback');
  });

  return [{
    message: {
      text: 'doing db stuff beep boop'
    }
  }];
};

module.exports.commandTestAddPollOption = (message, commandMsg) => {
  dbUtils.addPollOption(1, 'option', 'foo', () => {
    console.log('in callback');
  });

  return [{
    message: {
      text: 'doing db stuff beep boop'
    }
  }];
};

module.exports.commandTestAddPollVote = (message, commandMsg) => {
  dbUtils.addPollVote(1, 'user', '0', () => {
    console.log('in callback');
  });

  return [{
    message: {
      text: 'doing db stuff beep boop'
    }
  }];
};

module.exports.commandTestPollResults = (message, commandMsg) => {
  dbUtils.getPollResults(1, () => {
    console.log('in callback');
  });

  return [{
    message: {
      text: 'doing db stuff beep boop'
    }
  }];
};

module.exports.commandEndPoll = (message, commandMsg) => {
  dbUtils.endPoll(1, 'foo', () => {
    console.log('in callback');
  });

  return [{
    message: {
      text: 'doing db stuff beep boop'
    }
  }];
};

module.exports.honkForceEngage = (message, commandMsg) => {
  return [{
    method: 'reply',
    message : {
      text: `<@U2ASHP5FT> <@U2B42D486> <@U2ARFPF62> Honk Force One Is Requesting Takeoff`,
      channel: message.channel
    }
  }];
}

module.exports.constructAdditionalPylons = (message, commandMsg) => {
  return [{
    method: 'reply',
    message : {
      text: `<@U2ARW2Y3X> <@U2B5ZB8A1> <@U2B8ZPPPW> WE MUST CONSTRUCT ADDITIONAL PYLONS`,
      channel: message.channel
    }
  }];
}

module.exports.updateGiphyScore = (message, args, messageHandler) => {
  let wasCorrect = args.substring(args.indexOf(' ' + 1));

  if (!isValidGiphyVote(wasCorrect)) {
    return [{
      method: 'reply',
      message: {
        text: 'use `!giphy <1/0/:+1:/:-1:/+1/-1>`',
        channel: message.channel
      }
    }];
  }

  if (isPositiveGiphyVote(wasCorrect)) {
    wasCorrect = 1;
  } else if (isNegativeGiphyVote(wasCorrect)) {
    wasCorrect = 0;
  }

  dbUtils.updateGiphyScore(parseInt(wasCorrect), (results) => {
    const correct = results[0][0].correct;
    const incorrect = results[0][0].incorrect;

    var responses = [{
      method: 'reply',
      message: {
        text: `giphy was ${wasCorrect ? 'correct' : 'incorrect'}! giphy score is now \`${correct} - ${incorrect}\``,
        channel: message.channel
      }
    }];

    messageHandler.send(message, responses);
  });
};

isValidGiphyVote = (vote) => {
  return isPositiveGiphyVote(vote) || isNegativeGiphyVote(vote);
}

isPositiveGiphyVote = (vote) => {
  return vote === '1' || vote === '+1' || vote.indexOf('+1') !== -1 || vote === 'fuck yeah';
}

isNegativeGiphyVote = (vote) => {
  return vote === '0' || vote === '-1' || vote.indexOf('-1') !== -1 || vote === 'fuck you';
}

module.exports.getGiphyScore = (message, args, messageHandler) => {
  dbUtils.getGiphyScore((results) => {
    const correct = results[0].correct;
    const incorrect = results[0].incorrect;

    var responses = [{
      method: 'reply',
      message: {
        text: `giphy score is \`${correct} - ${incorrect}\``,
        channel: message.channel
      }
    }];

    messageHandler.send(message, responses);
  });
};