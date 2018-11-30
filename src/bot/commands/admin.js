const dbUtils = require('../util/db/dbUtils.js');

const banList = [];

module.exports.commandUnban = (message, args) => {
  if (message.user !== 'U2ARFPF62') {
    return [{
      method: 'reply',
      message: {
        text: 'lol',
        channel: message.channel
      }
    }];
  }

  // get the user and add them to the ban list
  let user = args.split(' ')[0];
  user = user.replace('<@', '');
  user = user.replace('>', '');

  for (let ban in banList) {
    if (banList[ban].user === user) {
      banList[ban].isBanned = false;
      banList[ban].banDuration = 0;
      banList[ban].banStart = 0;
    }
  }
};

module.exports.commandBan = (message, args) => {
  if (message.user !== 'U2ARFPF62') {
    return [{
      method: 'reply',
      message: {
        text: 'lol',
        channel: message.channel
      }
    }];
  }

  // get the user and add them to the ban list
  let user = args.split(' ')[0];
  user = user.replace('<@', '');
  user = user.replace('>', '');

  const time = parseInt(args.split(' ')[1]);

  if (!user || !time) {
    return [{
      method: 'reply',
      message: {
        text: 'use `!ban <person> <minutes>`',
        channel: message.channel
      }
    }];
  }

  if (isUserBanned(user)) {
    return [{
      method: 'reply',
      message: {
        text: 'already banned',
        channel: message.channel
      }
    }];
  }

  const now = new Date().getTime();
  banList.push({
    user: user,
    banStart: now,
    banDuration: time,
    isBanned: true
  });
};

function isUserBanned(user) {
  if (!user) return false;

  user = user.toLowerCase();

  for (let ban in banList) {
    if (banList[ban].user === user && banList[ban].isBanned) {
      return true;
    }
  }

  return false;
}

module.exports.isUserBanned = isUserBanned;

module.exports.checkBans = () => {
  for (let ban in banList) {
    let now = new Date().getTime();
    let banServed = (now - banList[ban].banStart);

    let banTime = banList[ban].banDuration * 60000;

    if (banServed >= banTime) {
      banList[ban].isBanned = false;
      banList[ban].banDuration = 0;
      banList[ban].banStart = 0;
    }
  }
};

module.exports.resetGiphyScore = (message, args, messageHandler) => {
  if (message.user !== 'U2ARFPF62') {
    return [{
      method: 'reply',
      message: {
        text: 'lol',
        channel: message.channel
      }
    }];
  }

  let correct = args.split(' ')[0];
  let incorrect = args.split(' ')[1];

  if (!correct || !incorrect) {
    correct = 0;
    incorrect = 0;
  }

  dbUtils.resetGiphyScore(correct, incorrect, () => {
    console.log('giphy reset');

    var responses = [{
      method: 'reply',
      message: {
        text: `giphy score set to \`${correct} - ${incorrect}\``,
        channel: message.channel
      }
    }];

    messageHandler.send(message, responses);
  });
};