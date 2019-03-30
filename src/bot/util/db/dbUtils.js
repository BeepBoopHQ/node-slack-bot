const mysql = require('mysql');
require('dotenv').load();

const dbConn = process.env.JAWSDB_URL;
let connection = mysql.createConnection(dbConn);

module.exports.resetGiphyScore = (numCorrect, numIncorrect, cb) => {
  connection.query('CALL giphy_reset_score(?, ?)', [numCorrect, numIncorrect], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    cb();
  });
}

module.exports.updateGiphyScore = (wasCorrect, cb) => {
  connection.query('CALL giphy_update_score(?)', [wasCorrect], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    cb(results);
  });
}

module.exports.getGiphyScore = (cb) => {
  connection.query('SELECT correct, incorrect FROM giphy_score', (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    cb(results);
  });
}

module.exports.logCommandUse = (command, usedBy, cb) => {
  connection.query('CALL stats_updatecommandstats(?, ?)', [command, usedBy], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    if (cb) cb(results);
  });
}

module.exports.getCommandStats = (message, messageHandler) => {
  connection.query('CALL stats_getcommandstats', (error, results, fields) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    let statsString = '```';
    for (let i = 0; i < results[0].length; i++) {
      statsString += `\r\n!${results[0][i].commandName} used ${results[0][i].count} times - Last use: <@${results[0][i].lastUsedBy}> on ${results[0][i].lastUsedDate}`;
    }
    statsString += '```'

    messageHandler.send(message, [{
      doNotLog: 1,
      method: 'reply',
      message: {
        text: `Command stats:\r\n${statsString}`,
        channel: message.channel
      }
    }]);
  })
}