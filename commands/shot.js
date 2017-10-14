var exports = module.exports = {};

exports.commandShot = function commandShot(message, args, cb) {
  // get the user and get the number
  var user = args.split(' ')[0];
  var number = parseInt(args.split(' ')[1]);

  if (!user || !number) {
    cb([{
      method: 'reply',
      message: {
        text: 'use `!shot <person> <number>`'
      }
    }]);
    return;
  }

  if (number < 0 || number > 20) {
    cb([{
      method: 'reply',
      message: {
        text: 'use a number between 1 and 20'
      }
    }]);
    return;
  }

  var roll = Math.floor(Math.random() * (20 - 1 + 1)) + 1;
  var reply = '';

  if(roll === 1) {
    reply = `you rolled a *${roll}*, <@${message.user}>, you have to take a shot!`;
  } else if (roll === number || roll === 20) {
    reply = `you rolled a *${roll}*, success! ${user} has to take a shot!`;
  } else {
    reply = `you rolled a *${roll}*, too bad!`;
  }

  cb([{
    method: 'reply',
    message: {
      text: reply
    }
  }]);
}