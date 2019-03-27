const mysql = require('mysql');

require('dotenv').load();

const dbConn = process.env.JAWSDB_URL;
console.log(dbConn);

let connection = mysql.createConnection(dbConn);

module.exports.testDb = (cb) => {
  connection.connect();

  let solution = null;

  connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
    if (err) throw err;

    solution = rows[0].solution;

    console.log('DB solution is:', solution);

    cb(solution);
    
  });

  connection.end();
}

module.exports.startPoll = (user, channel, cb) => {

  // set up out params
  connection.query('SET @message = ""');
  connection.query('CALL start_poll(?, ?, @message)', [user, channel], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    console.log('results:', results);

    connection.query('SELECT @message', (error, results) => {
      if (error) {
        console.log('error:', error);
        return;
      }

      console.log('results:', results);

      cb();
    });
  });
}

module.exports.addPollOption = (idpoll, polloption, user, cb) => {

  // set up out params
  connection.query('SET @message = ""');
  connection.query('CALL add_poll_option(?, ?, ?, @message)', [idpoll, polloption, user], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    console.log('results', results);

    connection.query('SELECT @message', (error, results) => {
      if (error) {
        console.log('error:', error);
        return;
      }

      console.log('results:', results);

      cb();
    });
  });
}

module.exports.addPollVote = (idpoll, user, optionidx, cb) => {

  // set up out params
  connection.query('SET @message = ""');
  connection.query('CALL add_poll_vote(?, ?, ?, @message)', [idpoll, user, optionidx], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    console.log('results', results);

    connection.query('SELECT @message', (error, results) => {
      if (error) {
        console.log('error:', error);
        return;
      }

      console.log('results:', results);

      cb();
    });
  });
}

module.exports.getPollResults = (idpoll, cb) => {

  // set up out params
  connection.query('SET @message = ""');
  connection.query('CALL get_poll_results(?, @message)', [idpoll], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    console.log('results', results);

    connection.query('SELECT @message', (error, results) => {
      if (error) {
        console.log('error:', error);
        return;
      }

      console.log('results:', results);

      cb();
    });
  });
}

module.exports.endPoll = (idpoll, user, cb) => {

  // set up out params
  connection.query('SET @message = ""');
  connection.query('CALL end_poll(?, ?, @message)', [idpoll, user], (error, results) => {
    if (error) {
      console.log('error:', error);
      return;
    }

    console.log('results', results);

    connection.query('SELECT @message', (error, results) => {
      if (error) {
        console.log('error:', error);
        return;
      }

      console.log('results:', results);

      cb();
    });
  });
}

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