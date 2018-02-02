// express for heroku i guess
const express = require('express');

const Bot = require('../../../src/bot/bot');

module.exports.init = () => {
  // start russ
  Bot.startBot();

  // express
  let app = express();

  app.get('/', (req, res) => {
    res.send('Hi I am a bot');
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on port ', (process.env.PORT || 3000));
  });
}