var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN
var version = '`v1.3 \'orange sher-bert\'`';

var commands = {};

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

function getPollOptions(message) {
  if (message.indexOf(' or ') === -1) {
    pollOptions.push(message);
    return pollOptions;
  } else {
    var option = message.substr(0, message.indexOf(' or '));
    pollOptions.push(option);
    getPollOptions(message.substr(message.indexOf(' or ') + 4));
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
  if (pollOptions.length === 0) {
    bot.reply(message, 'there is no active poll, use `!poll <this> or <that>` to start your own');
    return;
  }

  var optionIndex = parseInt(commandMsg);

  if (isNaN(optionIndex) || optionIndex  > pollVotes.length || optionIndex <= 0) {
    bot.reply(message, 'your vote is invalid, use the number option to cast your vote: `!vote 1`');
    return;
  }


  for(userVote in pollUsers) {
    var existingUser = pollUsers[userVote].user;
    var existingVote = pollUsers[userVote].vote;

    if (existingUser === message.user) {
      var newVoteIndex = optionIndex - 1;
      var oldVoteIndex = existingVote;

      if(newVoteIndex === oldVoteIndex) {
        bot.reply(message, '<@' + message.user + '>, you already voted for this option');
        return;
      }

      bot.reply(message, '<@' + message.user + '> has changed their vote from `' + pollOptions[oldVoteIndex] + '` to `' + pollOptions[newVoteIndex] + '`');

      pollUsers[userVote].vote = newVoteIndex;
      pollVotes[newVoteIndex] += 1;
      pollVotes[oldVoteIndex] -= 1;

      if (checkForVoteMajority(pollVotes)) {
        var resultsArray = pollOptions.map(function(e, i) {
          var formatted = '`' + e + ': ' + pollVotes[i] + '`'
          return [formatted];
        });

        bot.reply(message, 'a majority has been reached in the poll. results are: ' + resultsArray.join(', '));
      }

      return;
    }
  }

  pollVotes[optionIndex - 1] += 1;
  bot.reply(message, '<@' + message.user + '>, your vote has been cast for `' + pollOptions[optionIndex - 1] + '`');

  var userVote = { user: message.user, vote: optionIndex - 1};

  pollUsers.push(userVote);

  if (checkForVoteMajority(pollVotes)) {
    var resultsArray = pollOptions.map(function(e, i) {
      var formatted = '`' + e + ': ' + pollVotes[i] + '`'
      return [formatted];
    });

    bot.reply(message, 'a majority has been reached in the poll. results are: ' + resultsArray.join(', '));
  }

  return;
}

function checkForVoteMajority(poll) {
  // check and see if this poll is over with
  return false;
}

function commandPoll(bot, message, commandMsg) {
  if (pollOptions.length !== 0) {
    bot.reply(message, 'another poll is already active.');
    var formattedOptions = pollOptions.map(function(opt) {
      return '`' + opt + '`'
    });

    bot.reply(message, '`!vote` for ' + formattedOptions);
    return;
  }

  // commandMsg should have a single instance of ' or '
  if (commandMsg.indexOf(' or ') === -1 && pollOptions.length === 0) {
    bot.reply(message, 'use `!poll <this> or <that>`');
    return;
  }

  getPollOptions(commandMsg);

  var formattedOptions = pollOptions.map(function(opt) {
    return '`' + opt + '`'
  });

  // build the user list for majority vote
  buildUserList(bot, message);

  bot.reply(message, 'a poll has been started! `!vote` for ' + pollOptions.join(', ') + '. this poll will be open for 10 minutes');
  pollOwner = message.user;
  pollVotes = Array.apply(null, Array(pollOptions.length)).map(Number.prototype.valueOf, 0);

  // set the timer for the poll
  setTimeout(function() {
    var resultsArray = pollOptions.map(function(e, i) {
      var formatted = '`' + e + ': ' + pollVotes[i] + '`'
      return [formatted];
    });

    bot.reply(message, 'poll is closed! results are: ' + resultsArray.join(', '));

    pollOptions = [];
    pollVotes = [];
    pollUsers = [];
    pollOwner = '';
  }, 600000); // 10mins

  return;
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
    console.log(response);
  });
}
