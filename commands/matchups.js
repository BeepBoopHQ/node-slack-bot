var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.MySQLConnection,
    user: process.env.MySQLUsername,
    password: process.env.MySQLPassword,
    database: 'goons'
});

connection.connect();

var exports = module.exports = {};

function getMatchups(weekNum) {



        var matchupString = '```Matchups for week ' + weekNum + ':\n';
        switch(weekNum) {
            case 1:
                matchupString += `
Thu Sep 7 @ 5:30 PM - Chiefs at Patriots
Sun Sep 10 @ 10:00 AM - Cardinals at Lions
             10:00 AM - Falcons at Bears
             10:00 AM - Ravens at Bengals
             10:00 AM - Jaguars at Texans
             10:00 AM - Jets at Bills
             10:00 AM - Raiders at Titans
             10:00 AM - Eagles at Redskins
             10:00 AM - Steelers at Browns
             10:00 AM - Buccaneers at Dolphins
             1:05 PM - Colts at Rams
             1:25 PM - Panthers at 49ers
             1:25 PM - **Seahawks** at Packers
             5:30 PM - Giants at Cowboys
Mon Sep 11 @ 4:10 PM - Saints at Vikings
             7:20 PM - Chargers at Broncos
                `;
                break;
            case 2:
                matchupString += `
Thu Sep 14 @ 5:25 PM - Texans at Bengals
Sun Sep 17 @ 10:00 AM - Cardinals at Colts
             10:00 AM - Bills at Panthers
             10:00 AM - Bears at Buccaneers
             10:00 AM - Browns at Ravens
             10:00 AM - Vikings at Steelers
             10:00 AM - Patriots at Saints
             10:00 AM - Eagles at Chiefs
             10:00 AM - Titans at Jaguars
             1:05 PM - Dolphins at Chargers
             1:05 PM - Jets at Raiders
             1:25 PM - Cowboys at Broncos
             1:25 PM - 49ers at **Seahawks**
             1:25 PM - Redskins at Rams
             5:30 PM - Packers at Falcons
Mon Sep 18 @ 5:30 PM - Lions at Giants
                `;
                break;
            case 3:
                matchupString += `
Thu Sep 21 @ 5:25 PM - Rams at 49ers
Sun Sep 24 @ 6:30 AM - Ravens at Jaguars (London)
             10:00 AM - Falcons at Lions
             10:00 AM - Browns at Colts
             10:00 AM - Broncos at Bills
             10:00 AM - Texans at Patriots
             10:00 AM - Dolphins at Jets
             10:00 AM - Saints at Panthers
             10:00 AM - Giants at Eagles
             10:00 AM - Steelers at Bears
             10:00 AM - Buccaneers at Vikings
             1:05 PM - **Seahawks** at Titans
             1:25 PM - Bengals at Packers
             1:25 PM - Chiefs at Chargers
             5:30 PM - Raiders at Redskins
Mon Sep 25 @ 5:30 PM - Cowboys at Cardinals
                `;
                break;
            case 4:
                matchupString += `
Thu Sep 28 @ 5:25 PM - Bears at Packers
Sun Oct 1 @ 6:30 AM - Saints at Dolphins (London)
            10:00 AM - Bills at Falcons
            10:00 AM - Panthers at Patriots
            10:00 AM - Bengals at Browns
            10:00 AM - Lions at Vikings
            10:00 AM - Jaguars at Jets
            10:00 AM - Rams at Cowboys
            10:00 AM - Steelers at Ravens
            10:00 AM - Titans at Texans
            1:05 PM - Giants at Buccaneers
            1:05 PM - Eagles at Chargers
            1:05 PM - 49ers at Cardinals
            1:25 PM - Raiders at Broncos
            5:30 PM - Colts at **Seahawks**
Mon Oct 2 @ 5:30 PM - Redskins at Chiefs
                `;
                break;
            case 5:
                matchupString += `
Thu Oct 5 @ 5:25 PM - Patriots at Buccaneers
Sun Oct 8 @ 10:00 AM - Cardinals at Eagles
            10:00 AM - Bills at Bengals
            10:00 AM - Panthers at Lions
            10:00 AM - Jaguars at Steelers
            10:00 AM - Chargers at Giants
            10:00 AM - Jets at Browns
            10:00 AM - 49ers at Colts
            10:00 AM - Titans at Dolphins
            1:05 PM - Ravens at Raiders
            1:05 PM - **Seahawks** at Rams
            1:25 PM - Packers at Cowboys
            5:30 PM - Chiefs at Texans
Mon Oct 9 @ 5:30 PM - Vikings at Bears

Bye: Atlanta, Denver, New Orleans, Washington
                `;
                break;
            case 6:
                matchupString += `
Thu Oct 12 @ 5:25 PM - Eagles at Panthers
Sun Oct 15 @ 10:00 AM - Bears at Ravens
             10:00 AM - Browns at Texans
             10:00 AM - Lions at Saints
             10:00 AM - Packers at Vikings
             10:00 AM - Dolphins at Falcons
             10:00 AM - Patriots at Jets
             10:00 AM - 49ers at Redskins
             1:05 PM - Rams at Jaguars
             1:05 PM - Buccaneers at Cardinals
             1:25 PM - Chargers at Raiders
             1:25 PM - Steelers at Chiefs
             5:30 PM - Giants at Broncos
Mon Oct 16 @ 5:30 PM - Colts at Titans

Bye: Buffalo, Cincinnati, Dallas, Seattle
                `;
                break;
            case 7:
                matchupString += `
Thu Oct 19 @ 5:25 PM - Chiefs at Raiders
Sun Oct 22 @ 10:00 AM - Cardinals at Rams (London)
             10:00 AM - Ravens at Vikings
             10:00 AM - Panthers at Bears
             10:00 AM - Bengals at Steelers
             10:00 AM - Jaguars at Colts
             10:00 AM - Saints at Packers
             10:00 AM - Jets at Dolphins
             10:00 AM - Buccaneers at Bills
             10:00 AM - Titans at Browns
             1:05 PM - Cowboys at 49ers
             1:25 PM - Broncos at Chargers
             1:25 PM - **Seahawks** at Giants
             5:30 PM - Falcons at Patriots
Mon Oct 23 @ 5:30 PM - Redskins at Eagles

Bye: Detroit, Houston
                `;
                break;
            case 8:
                matchupString += `
Thu Oct 26 @ 5:25 PM - Dolphins at Ravens
Sun Oct 29 @ 6:30 AM - Vikings at Browns (London)
            10:00 AM - Falcons at Jets
            10:00 AM - Panthers at Buccaneers
            10:00 AM - Bears at Saints
            10:00 AM - Colts at Bengals
            10:00 AM - Chargers at Patriots
            10:00 AM - Raiders at Bills
            10:00 AM - 49ers at Eagles
            1:05 PM - Texans at **Seahawks**
            1:25 PM - Cowboys at Redskins
            5:30 PM - Steelers at Lions
Mon Oct 30 @ 5:30 PM - Broncos at Chiefs

Bye: Arizona, Green Bay, Jacksonville, Los Angeles, N.Y. Giants, Tennessee
                `;
                break;
            case 9:
                matchupString += `
Thu Nov 2 @ 5:25 PM - Bills at Jets
Sun Nov 5 @ 10:00 AM - Falcons at Panthers
            10:00 AM - Ravens at Titans
            10:00 AM - Bengals at Jaguars
            10:00 AM - Broncos at Eagles
            10:00 AM - Colts at Texans
            10:00 AM - Rams at Giants
            10:00 AM - Buccaneers at Saints
            1:05 PM - Cardinals at 49ers
            1:05 PM - Redskins at **Seahawks**
            1:25 PM - Chiefs at Cowboys
            5:30 PM - Raiders at Dolphins
Mon Nov 6 @ 5:30 PM - Lions at Packers

Bye: Chicago, Cleveland, Los Angeles, Minnesota, New England, Pittsburgh
                `;
                break;
            case 10:
                matchupString += `
Thu Nov 9 @ 5:25 PM - **Seahawks** at Cardinals
Sun Nov 12 @ 10:00 AM - Bengals at Titans
             10:00 AM - Browns at Lions
             10:00 AM - Packers at Bears
             10:00 AM - Chargers at Jaguars
             10:00 AM - Vikings at Redskins
             10:00 AM - Saints at Bills
             10:00 AM - Jets at Buccaneers
             10:00 AM - Steelers at Colts
             1:05 PM - Texans at Rams
             1:25 PM - Cowboys at Falcons
             1:25 PM - Giants at 49ers
             5:30 PM - Patriots at Broncos
Mon Nov 13 @ 5:30 PM - Dolphins at Panthers

Bye: Baltimore, Kansas City, Oakland, Philadelphia
                `;
                break;
            case 11:
                matchupString += `
Thu Nov 16 @ 5:25 PM - Titans at Steelers
Sun Nov 19 @ 10:00 AM - Cardinals at Texans
             10:00 AM - Ravens at Packers
             10:00 AM - Lions at Bears
             10:00 AM - Jaguars at Browns
             10:00 AM - Chiefs at Giants
             10:00 AM - Rams at Vikings
             10:00 AM - Redskins at Saints
             1:05 PM - Bills at Chargers
             1:25 PM - Bengals at Broncos
             1:25 PM - Patriots at Raiders (Mexico City)
             5:30 PM - Eagles at Cowboys
Mon Nov 20 @ 5:30 PM - Falcons at **Seahawks**

Bye: Carolina, Indianapolis, Miami, N.Y. Jets, San Francisco, Tampa Bay
                `;
                break;
            case 12:
                matchupString += `
Thu Nov 23 @ 9:30 AM - Vikings at Lions
             1:30 PM - Chargers at Cowboys
             5:30 PM - Giants at Redskins
Sun Nov 26 @ 10:00 AM - Bills at Chiefs
             10:00 AM - Panthers at Jets
             10:00 AM - Bears at Eagles
             10:00 AM - Browns at Bengals
             10:00 AM - Dolphins at Patriots
             10:00 AM - Buccaneers at Falcons
             10:00 AM - Titans at Colts
             1:05 PM - Saints at Rams
             1:05 PM - **Seahawks** at 49ers
             1:25 PM - Broncos at Raiders
             1:25 PM - Jaguars at Cardinals
             5:30 PM - Packers at Steelers
Mon Nov 27 @ 5:30 PM - Texans at Ravens
                `;
                break;
            case 13:
                matchupString += `
Thu Nov 30 @ 5:25 PM - Redskins at Cowboys
Sun Dec 3 @ 10:00 AM - Panthers at Saints
            10:00 AM - Broncos at Dolphins
            10:00 AM - Lions at Ravens
            10:00 AM - Texans at Titans
            10:00 AM - Colts at Jaguars
            10:00 AM - Chiefs at Jets
            10:00 AM - Vikings at Falcons
            10:00 AM - Patriots at Bills
            10:00 AM - 49ers at Bears
            10:00 AM - Buccaneers at Packers
            1:05 PM - Browns at Chargers
            1:25 PM - Rams at Cardinals
            1:25 PM - Giants at Raiders
            5:30 PM - Eagles at **Seahawks**
Mon Dec 4 @ 5:30 PM - Steelers at Bengals
                `;
                break;
            case 14:
                matchupString += `
Thu Dec 7 @ 5:25 PM - Saints at Falcons
Sun Dec 10 @ 10:00 AM - Bears at Bengals
             10:00 AM - Lions at Buccaneers
             10:00 AM - Packers at Browns
             10:00 AM - Colts at Bills
             10:00 AM - Vikings at Panthers
             10:00 AM - Raiders at Chiefs
             10:00 AM - 49ers at Texans
             10:00 AM - **Seahawks** at Jaguars
             1:05 PM - Jets at Broncos
             1:05 PM - Titans at Cardinals
             1:05 PM - Redskins at Chargers
             1:25 PM - Cowboys at Giants
             1:25 PM - Eagles at Rams
             5:30 PM - Ravens at Steelers
Mon Dec 11 @ 5:30 PM - Patriots at Dolphins
                `;
                break;
            case 15:
                matchupString += `
Thu Dec 14 @ 5:25 PM - Broncos at Colts
Sat Dec 16 @ 1:30 PM - Bears at Lions
             5:25 PM - Chargers at Chiefs
Sun Dec 17 @ 10:00 AM - Cardinals at Redskins
             10:00 AM - Ravens at Browns
             10:00 AM - Bengals at Vikings
             10:00 AM - Packers at Panthers
             10:00 AM - Texans at Jaguars
             10:00 AM - Dolphins at Bills
             10:00 AM - Jets at Saints
             10:00 AM - Eagles at Giants
             1:05 PM - Rams at **Seahawks**
             1:25 PM - Patriots at Steelers
             1:25 PM - Titans at 49ers
             5:30 PM - Cowboys at Raiders
Mon Dec 18 @ 5:30 PM - Falcons at Buccaneers
                `;
                break;
            case 16:
                matchupString += `
Sat Dec 23 @ 1:30 PM - Colts at Ravens
             5:30 PM - Vikings at Packers
Sun Dec 24 @ 10:00 AM - Falcons at Saints
             10:00 AM - Bills at Patriots
             10:00 AM - Browns at Bears
             10:00 AM - Broncos at Redskins
             10:00 AM - Lions at Bengals
             10:00 AM - Chargers at Jets
             10:00 AM - Rams at Titans
             10:00 AM - Dolphins at Chiefs
             10:00 AM - Buccaneers at Panthers
             1:05 PM - Jaguars at 49ers
             1:25 PM - Giants at Cardinals
             1:25 PM - **Seahawks** at Cowboys
Mon Dec 25 @ 1:30 PM - Steelers at Texans
             5:30 PM - Raiders at Eagles
                `;
                break;
            case 17:
                matchupString += `
Sun Dec 31 @ 10:00 AM - Bills at Dolphins
             10:00 AM - Panthers at Falcons
             10:00 AM - Bears at Vikings
             10:00 AM - Bengals at Ravens
             10:00 AM - Browns at Steelers
             10:00 AM - Cowboys at Eagles
             10:00 AM - Packers at Lions
             10:00 AM - Texans at Colts
             10:00 AM - Jaguars at Titans
             10:00 AM - Saints at Buccaneers
             10:00 AM - Jets at Patriots
             10:00 AM - Redskins at Giants
             1:25 PM - Cardinals at **Seahawks**
             1:25 PM - Chiefs at Broncos
             1:25 PM - Raiders at Chargers
             1:25 PM - 49ers at Rams
                `;
                break;
                
        }

        return  matchupString + '```';
    }

exports.commandMatchups = function commandMatchups(message, commandMsg) {
  var weekNum = parseInt(commandMsg);

  if (!weekNum) weekNum = 0;

  // todo: save this shit in a db somewhere cause this is a nightmare
  var weeklyMatchupString = getMatchups(weekNum);

  return [{
      method: 'reply',
      message: {
          text: weeklyMatchupString
      }
  }];
}

exports.commandInsertMatchup = function commandInsertMatchup(message, commandMsg) {
    // ok we're expecting: <week> <mm-dd:hh:MM> <home> <away>

    if (commandMsg.indexOf(' ') === -1) {
        return [{
            method: 'reply',
            message: {
                text: 'invalid format'
            }
        }];
    }

    // get the vars
    var week = parseInt(commandMsg.split(' ')[0]);
    var date = commandMsg.split(' ')[1];
    var time = commandMsg.split(' ')[2]
    var home = commandMsg.split(' ')[3];
    var away = commandMsg.split(' ')[4];

    // error checking
    if (isNaN(week) || !date || !time || !home || !away) {
        return [{
            method: 'reply',
            message: {
                text: 'invalid format'
            }
        }];
    }

    var matchup = {
        week: week,
        homeTeam: home,
        awayTeam: away,
        startDate: `${date} ${time}`
    };

    // insert something
    connection.query('INSERT INTO matchup SET ?', matchup, function(error, results, fields) {
        if (error) {
            console.log(error);
            connection.end();
            throw error;
        }
    });

    return [{
        method: 'reply',
        message: {
            text: `inserted \`${week} ${date} ${time} ${home} ${away}\``
        }
    }];

}

function getDbMatchups(message, commandMsg) {

    var weekNum = commandMsg;

    if (!weekNum || weekNum === 0) {
        var now = Date.now();

        if (now < Date.parse("9/4/2017")) {
            weekNum = 1;
        }
        else if (now < Date.parse("9/11/2017")) {
            weekNum = 2;
        }
        else if (now < Date.parse("9/18/2017")) {
            weekNum = 3
        }
        else if (now < Date.parse("9/25/2017")) {
            weekNum = 4
        }
        else if (now < Date.parse("10/3/2017")) {
            weekNum = 5
        }
        else if (now < Date.parse("10/10/2017")) {
            weekNum = 6
        }
        else if (now < Date.parse("10/17/2017")) {
            weekNum = 7
        }
        else if (now < Date.parse("10/24/2017")) {
            weekNum = 8
        }
        else if (now < Date.parse("10/31/2017")) {
            weekNum = 9
        }
        else if (now < Date.parse("11/7/2017")) {
            weekNum = 10
        }
        else if (now < Date.parse("11/14/2017")) {
            weekNum = 11
        }
        else if (now < Date.parse("11/21/2017")) {
            weekNum = 12
        }
        else if (now < Date.parse("11/28/2017")) {
            weekNum = 13
        }
        else if (now < Date.parse("12/5/2017")) {
            weekNum = 14
        }
        else if (now < Date.parse("12/12/2017")) {
            weekNum = 15
        }
        else if (now < Date.parse("12/19/2017")) {
            weekNum = 16
        }
        else if (now < Date.parse("12/26/2017")) {
            weekNum = 17
        }
        else {
            return [{
                method: 'reply',
                message: {
                    text: 'No games found'
                }
            }];
        }
    }

    getMatchupsByWeek(weekNum, function(err, result) {
        if (!err) {
            return [{
                method: 'reply',
                message: {
                    text: result
                }
            }];
        } else {
            console.log(err);
        }
    });
}

function getMatchupsByWeek(weekNum, callback) {
    console.log('inside getMatchupsByWeek');
    connection.query('CALL getMatchupsByWeek(?)', [weekNum], function(error, results) {
        if (error) {
            callback(true, err);
            throw error;
        }

        var returnStr = '```' + `Week ${weekNum} matchups:\n`;

        console.log(`results: ${results}`);
        console.log(`results len: ${results.length}`);

        for (var i = 0; i < results.length; i++) {
            console.log(results[i]);
            returnStr += `${results[i].startDate} - ${results[i].awayTeam} @ ${results[i].homeTeam}\n`;
        }

        returnStr += '```';

        callback(null, returnStr);
    });
}

exports.commandDbMatchups = function(message, args, cb) {

    // validate the week
    var weekNum = parseInt(args);

    if (isNaN(weekNum)) {
        cb([{
            method: 'reply',
            message: {
                text: 'week is invalid'
            }
        }]);
        return;
    }

    if (!weekNum || weekNum === 0) {
        var now = Date.now();

        if (now < Date.parse("9/4/2017")) {
            weekNum = 1;
        }
        else if (now < Date.parse("9/11/2017")) {
            weekNum = 2;
        }
        else if (now < Date.parse("9/18/2017")) {
            weekNum = 3
        }
        else if (now < Date.parse("9/25/2017")) {
            weekNum = 4
        }
        else if (now < Date.parse("10/3/2017")) {
            weekNum = 5
        }
        else if (now < Date.parse("10/10/2017")) {
            weekNum = 6
        }
        else if (now < Date.parse("10/17/2017")) {
            weekNum = 7
        }
        else if (now < Date.parse("10/24/2017")) {
            weekNum = 8
        }
        else if (now < Date.parse("10/31/2017")) {
            weekNum = 9
        }
        else if (now < Date.parse("11/7/2017")) {
            weekNum = 10
        }
        else if (now < Date.parse("11/14/2017")) {
            weekNum = 11
        }
        else if (now < Date.parse("11/21/2017")) {
            weekNum = 12
        }
        else if (now < Date.parse("11/28/2017")) {
            weekNum = 13
        }
        else if (now < Date.parse("12/5/2017")) {
            weekNum = 14
        }
        else if (now < Date.parse("12/12/2017")) {
            weekNum = 15
        }
        else if (now < Date.parse("12/19/2017")) {
            weekNum = 16
        }
        else if (now < Date.parse("12/26/2017")) {
            weekNum = 17
        }
        else {
            return [{
                method: 'reply',
                message: {
                    text: 'No games found'
                }
            }];
        }
    }

    connection.query('CALL getMatchupsByWeek(?)', [weekNum], function(error, results) {
        if (error) {
            cb([{
                method: 'reply',
                message: {
                    text: 'there was an error getting matchups'
                }
            }]);
            throw error;
        }

        var matchupString = '```' + `Week ${weekNum} matchups:\n`;

        console.log(`results: ${results}`);

        for (var i = 0; i < results.length; i++) {
            var matchup = results[i][0];
            console.log(matchup);
            matchupString += `${matchup.startDate} - ${matchup.awayTeam} @ ${matchup.homeTeam}\n`;
        }

        matchupString += '```';

        cb([{
            method: 'reply',
            message: {
                text: matchupString
            }
        }]);
        return;
    });

    
}