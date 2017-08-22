var mysql = require('mysql');
var connection = mysql.createConnection({
    host: process.env.MySQLConnection,
    user: process.env.MySQLUsername,
    password: process.env.MySQLPassword,
    database: 'goons'
});

connection.connect(function(err) {
    console.log(err.code);
    console.log(err.fatal);
});

var exports = module.exports = {};

exports.commandInsertMatchup = function commandInsertMatchup(message, commandMsg, cb) {
    // ok we're expecting: <week> <mm-dd:hh:MM> <home> <away>

    if (commandMsg.indexOf(' ') === -1) {
        cb([{
            method: 'reply',
            message: {
                text: 'invalid format'
            }
        }]);
        return;
    }

    // get the vars
    var week = parseInt(commandMsg.split(' ')[0]);
    var date = commandMsg.split(' ')[1];
    var time = commandMsg.split(' ')[2]
    var home = commandMsg.split(' ')[3];
    var away = commandMsg.split(' ')[4];

    // error checking
    if (isNaN(week) || !date || !time || !home || !away) {
        cb([{
            method: 'reply',
            message: {
                text: 'invalid format'
            }
        }]);
        return;
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

    cb([{
        method: 'reply',
        message: {
            text: `inserted \`${week} ${date} ${time} ${home} ${away}\``
        }
    }]);
    return;
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

    connection.query('CALL getMatchupsByWeek(?)', [weekNum], function(error, rows, fields) {
        if (error) {
            cb([{
                method: 'reply',
                message: {
                    text: 'there was an error getting matchups'
                }
            }]);
            throw error;
        }

        var jsonString = JSON.stringify(rows);
        var resultJson = JSON.parse(jsonString);

        var matchupString = '```' + `Week ${weekNum} matchups:\n`;

        for (var i = 0; i < resultJson[0].length; i++) {
            var matchup = resultJson[0][i];
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