var exports = module.exports = {};

exports.commandShot = function commandShot(message, args) {
  // get the user and get the number
  var user = args.split(' ')[0];
  var number = parseInt(args.split(' ')[1]);

  if (!user || !number) {
    return 'use `!shot <person> <number>`';
  }

  if (number < 0 || number > 20) {
    return 'use a number between 1 and 20';
  }

  var roll = Math.floor(Math.random() * (20 - 1 + 1)) + 1;

  if(roll === 1) {
    return `you rolled a *${roll}*, <@${message.user}>, you have to take a shot!`;
  } else if (roll === number || roll === 20) {
    return `you rolled a *${roll}*, success! ${user} has to take a shot!`;
  } else {
    return `you rolled a *${roll}*, too bad!`;
  }
}