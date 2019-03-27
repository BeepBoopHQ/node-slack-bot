require('dotenv').load();
var client = require('redis').createClient(process.env.REDIS_URL);
const dbUtils = require('../util/db/dbUtils.js');



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