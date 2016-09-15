var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN
var version = '`v1.3 \'orange sher-bert\'`';

var commands = {};

var polls = {};

var pollOptions = [];
var pollVotes = [];
var pollUsers = [];
var pollOwner = '';
var channelUsers = [];

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM');

    bot.say({
      text: 'russell_bot has connected',
      channel: 'C2ARE3TQU'
    });

    bot.say({
      text: 'running ' + version,
      channel: 'C2ARE3TQU'
    });

    // run the poll timer
    setInterval(function() {
      for(key in polls) {
        if(polls.hasOwnProperty(key) && polls[key] !== null) {

          var currentTimeSeconds = new Date().getTime() / 1000;

          if (currentTimeSeconds - polls[key].startTime > 3) { // if 10 minutes have passed (600000)
            console.log('ending poll ' + key);
            var resultsArray = polls[key].options.map(function(e, i) {
              var formatted =  '`' + e[0].replace(/`/, '') + ': ' + polls[key].votes[i] + '`';
              return [formatted];
            });

            bot.say({
              text: '<@' + key + '>\'s poll has ended. results are: ' + resultsArray.join(', '),
              channel: polls[key].channel
            });

            polls[key] = null;
          }
        }
      }
    }, 10000);
  });
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

// build the command dictionary
buildCommandDictionary();

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, '#gohawks');
});

controller.hears('^!(.*)\s?(.*)?$', ['ambient','mention','direct_message','direct_mention'], function (bot, message) {

  var command = message.match[1].toLowerCase();
  var commandMsg = '';

  if (command.indexOf(' ') !== -1) {
    commandMsg = command.substr(command.indexOf(' ') + 1);
    command = command.substr(0, command.indexOf(' '));
  }

  if(!(command in commands)) {
    return;
  }

  commands[command](bot, message, commandMsg);
});

function formatPollOptions(message) {
  console.log('parsing this: ' + message);
  if (message.indexOf(' or ') === -1) {
    pollOptions.push(message);

    console.log('pollOptions pre-format: ' + pollOptions);

    var formattedOptions = pollOptions.map(function(e, i) {
      var formatted = '`' + e + '`';
      return [formatted];
    });

    console.log('formatted options: ' + formattedOptions);

    pollOptions = [];

    return formattedOptions;
  } else {
    var option = message.substr(0, message.indexOf(' or '));
    console.log('got this option: ' + option);
    pollOptions.push(option);
    return formatPollOptions(message.substr(message.indexOf(' or ') + 4));
  }
}

function commandResetPoll(bot, message, commandMsg) {
  var formattedOptions = pollOptions.map(function(opt) {
    return '`' + opt + '`'
  });

  bot.reply(message, 'resetting current poll, `!vote` again for ' + formattedOptions);

  pollVotes = [];
  pollUsers = [];
  return;
}

function commandEndPoll(bot, message, commandMsg) {
  if (message.user !== pollOwner) {
    bot.reply(message, 'only <@' + pollOwner + '> can close this poll');
    return;
  }

  var resultsArray = pollOptions.map(function(e, i) {
    var formatted = '`' + e + ': ' + pollVotes[i] + '`'
    return [formatted];
  });

  bot.reply(message, 'poll is closed! results are: ' + resultsArray.join(', '));

  pollOptions = [];
  pollVotes = [];
  pollUsers = [];
  pollOwner = '';

  return;
}

function commandPollResults(bot, message, commandMsg) {

  // polls are one poll per user
  if(!pollOptions[message.user] || pollOptions[message.user] === 0) {
    // this user has no poll

  }

  if (pollOptions.length === 0) {
    bot.reply(message, 'there is no active poll, use `!poll <this> or <that>` to start your own');
    return;
  }

  var resultsArray = pollOptions.map(function(e, i) {
    var formatted = '`' + e + ': ' + pollVotes[i] + '`'
    return [formatted];
  });

  bot.reply(message, 'poll results are: ' + resultsArray.join(', '));
  return;
}

function commandVote(bot, message, commandMsg) {

  // we should have only 2 numbers in the command message
  var pollNumber = parseInt(commandMsg.split(' ')[0]);
  var voteOption = parseInt(commandMsg.split(' ')[1]);

  if(isNan(pollNumber) || isNan(voteOption) || !pollNumber || !voteOption) {
    bot.reply(message, 'your vote is invalid, use the number options to cast your vote: `!vote <poll number> <option number>`');
    return;
  }

  // check if this poll exists
  if (!polls[pollNumber - 1]) {
    bot.reply(message, pollNumber + ' is not a valid poll');
    return;
  }

  // this poll exists, check if the vote option is legit
  if(voteOption < 0 || voteOption > polls[pollNumber].options.length) {
    bot.reply(message, voteOption + ' is not a valid poll option for this poll');
    return;
  }

  // poll and vote are valid
  // go thru this poll and see if this user has voted
  var currentPoll = polls[pollNumber - 1];

  for(user in currentPoll.users) {
    // users: {userId, vote}
    var userId = currentPoll.users[user].userId;
    var existingVote = currentPoll.users[user].vote;
    if(userId === message.user) {
      // user has voted already
      if(existingVote === voteOption) {
        // already voted for this
        bot.reply(message, '<@' + message.user + '>, you already voted for this option');
        return;
      }

      // changing their vote
      bot.reply(message, '<@' + message.user + '> has changed their vote from `' + currentPoll.options[existingVote] + '` to `' + currentPoll.options[voteOption] + '`');
      currentPoll.votes[existingVote] -= 1;
      currentPoll.votes[voteOption] += 1;
      currentPoll.users[user].vote = voteOption;

      if (checkForVoteMajority(pollVotes)) {
        var resultsArray = pollOptions.map(function(e, i) {
          var formatted = '`' + e + ': ' + pollVotes[i] + '`'
          return [formatted];
        });

        bot.reply(message, 'a majority has been reached in the poll. results are: ' + resultsArray.join(', '));
        return;
      }

      return;
    }
  }

  // user isnt in the list of current votes, add them
  bot.reply(message, '<@>, your vote has been cast for ' + currentPoll.options[voteOption]);
  currentPoll.votes[voteOption] += 1;
  return;
}

function checkForVoteMajority(poll) {
  // check and see if this poll is over with
  return false;
}

function commandPoll(bot, message, commandMsg) {

  // commandMsg should have at least a single instance of ' or '
  if (commandMsg.indexOf(' or ') === -1 && pollOptions.length === 0) {
    bot.reply(message, 'use `!poll <this> or <that>`');
    return;
  }

  // polls are one per user
  if (!polls[message.user]) {
    // this user has no polls active

    var formattedPollChoices = formatPollOptions(commandMsg);
    console.log('pollChoices: ' + formattedPollChoices);
    console.log('commandMsg: ' + commandMsg);

    polls[message.user] = {user: message.user, options: formattedPollChoices, votes: Array.apply(null, Array(formattedPollChoices.length)).map(Number.prototype.valueOf, 0), users: [], startTime: new Date().getTime() / 1000, channel: message.channel};
  } else {
    bot.reply(message, '<@' + message.user + '>, you already have an active poll: ' + polls[message.user].options.join(', '));
    return;
  }

  bot.reply(message, 'a poll has been started! `!vote` for ' + polls[message.user].options.join(', ') + '. this poll will be open for 10 minutes');

  // build the user list for majority vote
  buildUserList(bot, message);

  console.log('polls: ' + JSON.stringify(polls));

  return;
}

function clearPoll(user) {
  polls[user] = null;
}

function commandBug(bot, message, commandMsg) {
  // log this to #russel_bot as well
  bot.say({
    text: 'a bug has been reported: ' + commandMsg,
    channel: 'C2AVCAC6L'
  });

  bot.reply(message, 'thanks for your bug report. you can find it in #robo_russ');
  return;
}

function commandBerto(bot, message, commandMsg) {
  bot.reply(message, '<@U2ASHP5FT> ayo berto :100:');
  return;
}

function commandGoHawks(bot, message, commandMsg) {
  bot.reply(message, '#gohawks');
  return;
}

function commandRussell(bot, message, commandMsg) {
  bot.reply(message, '`beep boop i am russell_bot`');
  return;
}

function commandFlipCoin(bot, message, commandMsg) {
  bot.reply(message, '<@' + message.user + '> flipped a coin!');
  bot.reply(message, ((Math.floor(Math.random() * (2 - 1 + 1)) + 1) === 1 ? 'It\'s Heads!' : 'It\'s Tails!'));
  return;
}

function showVersion(bot, message, commandMsg) {
  bot.reply(message, 'russell_bot version: `' + version + '`');
}

function listCommands(bot, message, commandMsg) {
  var commandList = 'commands available: ';

  for(var key in commands) {
    if (commands.hasOwnProperty(key)) {
      commandList += '`!' + key + '` ';
    }
  }

  bot.reply(message, commandList);
  return;
}

function commandLit(bot, message, commandMsg) {
  bot.reply(message, ':100::100::100::fire::fire::fire::champagne::champagne::champagne:');
  return;
}

function commandFeature(bot, message, commandMsg) {
  // log this to #russel_bot as well
  bot.say({
    text: 'feature request: ' + commandMsg,
    channel: 'C2BRPHPS4'
  });

  bot.reply(message, 'thanks for your feature request, <@' + message.user + '>, we _definitely_ take them seriously.');
  return;
}

function buildCommandDictionary() {
  commands['berto'] = commandBerto;
  commands['gohawks'] = commandGoHawks;
  commands['russell'] = commandRussell;
  commands['flipcoin'] = commandFlipCoin;
  commands['bug'] = commandBug;
  commands['version'] = showVersion;
  commands['poll'] = commandPoll;
  commands['vote'] = commandVote;
  commands['pollresults'] = commandPollResults;
  commands['endpoll'] = commandEndPoll;
  commands['resetpoll'] = commandResetPoll;
  commands['lit'] = commandLit;
  commands['feature'] = commandFeature;
  commands['commands'] = listCommands;
}

function buildUserList(bot, message) {
  bot.api.channels.list({}, function(err, response){
    console.log('err: ' + err);
    console.log('response: ' + response);
    if (err) {
      channelUsers = [];
      return;
    }

    var jsonResponse = JSON.parse(JSON.stringify(response));

    for(var channel in jsonResponse.channels) {
      channelUsers.push({channel: jsonResponse.channels[channel].id, users: jsonResponse.channels[channel].members});
    }
  });
}
