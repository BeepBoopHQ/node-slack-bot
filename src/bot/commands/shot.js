module.exports.commandShot = (message, args) => {
  // get the user and get the number
  const user = args.split(' ')[0];
  const number = parseInt(args.split(' ')[1]);

  if (!user || !number) {
    return [{
      doNotLog: 1,
      method: 'reply',
      message: {
        text: 'use `!shot <person> <number>`',
        channel: message.channel
      }
    }];
  }

  if (number < 0 || number > 20) {
    return [{
      doNotLog: 1,
      method: 'reply',
      message: {
        text: 'use a number between 1 and 20',
        channel: message.channel
      }
    }];
  }

  const roll = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
  let reply = '';

  if (roll === 1) {
    reply = `you rolled a *${roll}*, <@${message.user}>, you have to take a shot!`;
  } else if (roll === number || roll === 20) {
    reply = `you rolled a *${roll}*, success! ${user} has to take a shot!`;
  } else {
    reply = `you rolled a *${roll}*, too bad!`;
  }

  return [{
    method: 'reply',
    message: {
      text: reply,
      channel: message.channel
    }
  }];
};
