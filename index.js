var Botkit = require('botkit');
var firebaseStorage = require('botkit-storage-firebase')({firebase_uri: 'https://league-of-goons-bot.firebaseio.com/'});

var token = process.env.SLACK_TOKEN;
var version = '`v1.4 \'earl sweatbert\'`';

var commands = {};

var polls = {};

var pollOptions = [];
var pollVotes = [];
var pollUsers = [];
var pollOwner = '';
var channelUsers = [];
var pollMap = {};

var nflTokens = {};

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false,
  storage: firebaseStorage
});

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

          if (currentTimeSeconds - polls[key].startTime > (60 * 10)) { // if 10 minutes have passed
            console.log('ending poll ' + key);
            var resultsArray = polls[key].options.map(function(e, i) {
              var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + polls[key].votes[i] + '`';
              return [formatted];
            });

            bot.say({
              text: '<@' + key + '>\'s poll has ended. results are: ' + resultsArray.join(', '),
              channel: polls[key].channel
            });

            polls[key] = null;
            deletePollMapKey(key);
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

// grab the access keys from firebase
getTokensFromFirebase();

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

controller.hears('fantasy login', 'direct_message', function (bot, message) {
  // if someone says 'fantasy login' in a direct message to russell, start the fantasy login process
  // also jesus christ this seems so bad

  // get the users id and see if we already have a token for them
  if (!token_data || !token_data[message.user]) {
    // we dont have a token
    var askForUsername = function(err, convo) {
      convo.ask('What is your fantasy username (email address)?', function(response, convo) {
        console.log(response);
        convo.say('username is ' + response.text);
        askForPassword(response, convo);
        convo.next();
      });
    };

    var askForPassword = function(err, convo) {
      convo.ask('What is your fantasy password (yes this is sketchy af)', function(response, convo) {
        console.log(response);
        var success = getNflAccessToken(response.text);
        if(success) {
          convo.say('You are all set, use the fantasy commands');
          convo.next();
        }
      });
    };

    bot.startConversation(message, askForUsername);
  } else if (token_data[message.user]) {
    // we already have a token
    bot.reply(message, 'you already are logged in, use the fantasy commands to make shit work');
    return;
  }

  return;
});

function getNflAccessToken(response) {
  console.log(response);
  return true;
}

function getTokensFromFirebase() {
  // get the tokens from firebase
  // format is:
  // id: 'tokens',
  // tokens: [{user: '', token: ''}]

  controller.storage.teams.get('tokens', function(err, token_data) {
    console.log(err);
    console.log(token_data);

    if(err || !token_data) {
      console.log('error getting tokens from firebase');
      return;
    }

    console.log('got tokens from firebase: ' + JSON.stringify(token_data));
    nflTokens = token_data;
    return;

  });
}

function createPollMapKey(userId) {
  for(key in pollMap) {
    if(pollMap.hasOwnProperty(key)) {
      if (pollMap[key] === null || pollMap[key] === undefined) {
        pollMap[key] = userId;
        console.log('creating poll key: ' + key + ': ' + userId);
        return parseInt(key);
      }
    }
  }

  // add a new entry
  var newKey = Object.keys(pollMap).length;

  pollMap[newKey] = userId;
  console.log('creating poll key: ' + newKey + ': ' + userId);
  return newKey;
}

function deletePollMapKey(userId) {
  for(key in pollMap) {
    if(pollMap.hasOwnProperty(key)) {
      if (pollMap[key] === userId) {
        pollMap[key] = null;
        console.log('deleting poll key: ' + key);
      }
    }
  }
}

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
  var pollNumber = parseInt(commandMsg.split(' ')[0]);

  if(isNaN(pollNumber)) {
    bot.reply(message, '<@' + message.user + '>, this is an invalid poll');
    return;
  }

  if(pollMap[pollNumber - 1] === undefined) {
    bot.reply(message, '<@' + message.user + '>, this poll does not exist');
    return;
  }

  var pollUserId = pollMap[pollNumber - 1];
  var currentPoll = polls[pollUserId];

  if(currentPoll.user !== message.user) {
    bot.reply(message, '<@' + message.user + '>, only <@' + currentPoll.user + '> can reset this poll');
    return;
  }

  var resultsArray = currentPoll.options.map(function(e, i) {
    var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + polls[key].votes[i] + '`';
    return [formatted];
  });

  bot.reply(message, '<@' + message.user + '> has reset their poll. `!vote` again');

  polls[pollUserId].votes = Array.apply(null, Array(polls[pollUserId].options.length));
  polls[pollUserId].users = [];

  return;
}

function commandEndPoll(bot, message, commandMsg) {
  var pollNumber = parseInt(commandMsg.split(' ')[0]);

  if(isNaN(pollNumber)) {
    bot.reply(message, '<@' + message.user + '>, this is an invalid poll');
    return;
  }

  if(pollMap[pollNumber - 1] === undefined) {
    bot.reply(message, '<@' + message.user + '>, this poll does not exist');
    return;
  }

  var pollUserId = pollMap[pollNumber - 1];
  var currentPoll = polls[pollUserId];

  if(currentPoll.user !== message.user) {
    bot.reply(message, '<@' + message.user + '>, only <@' + currentPoll.user + '> can end this poll');
    return;
  }

  var resultsArray = currentPoll.options.map(function(e, i) {
    var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + currentPoll.votes[i] + '`';
    return [formatted];
  });

  bot.reply(message, '<@' + currentPoll.user + '>\'s poll is closed! results are: ' + resultsArray.join(', '));

  polls[pollUserId] = null;
  deletePollMapKey(pollUserId);

  return;
}

function commandPollResults(bot, message, commandMsg) {

  var pollNumber = parseInt(commandMsg.split(' ')[0]);

  if(isNaN(pollNumber)) {
    bot.reply(message, '<@' + message.user + '>, this is an invalid poll');
    return;
  }

  if(pollMap[pollNumber - 1] === undefined) {
    bot.reply(message, '<@' + message.user + '>, this poll does not exist');
    return;
  }

  var pollUserId = pollMap[pollNumber - 1];
  var currentPoll = polls[pollUserId];

  var resultsArray = currentPoll.options.map(function(e, i) {
    var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + currentPoll.votes[i] + '`';
    return [formatted];
  });

  bot.reply(message, '<@' + message.user + '>, this poll\'s results are: ' + resultsArray.join(', '));
  return;
}

function commandVote(bot, message, commandMsg) {

  console.log('commandMsg: ' + commandMsg);

  // we should have only 2 numbers in the command message
  var pollNumber = parseInt(commandMsg.split(' ')[0]);
  var voteOption = parseInt(commandMsg.split(' ')[1]);

  if(isNaN(pollNumber) || isNaN(voteOption)) {
    bot.reply(message, 'your vote is invalid, use the number options to cast your vote: `!vote <poll number> <option number>`');
    return;
  }

  // get the poll from the map
  var pollUserId = pollMap[pollNumber - 1];
  var currentPoll = polls[pollUserId];

  // check if this poll exists
  if (currentPoll === undefined || pollNumber <= 0) {
    bot.reply(message, pollNumber + ' is not a valid poll');
    return;
  }

  if(voteOption <= 0) {
    bot.reply(message, voteOption + ' is not a valid poll option');
    return;
  }

  console.log(JSON.stringify(currentPoll));

  // this poll exists, check if the vote option is legit
  if(voteOption > currentPoll.options.length) {
    bot.reply(message, voteOption + ' is not a valid poll option for this poll');
    return;
  }

  for(user in currentPoll.users) {
    // users: {userId, vote}
    var userId = currentPoll.users[user].userId;
    var existingVote = currentPoll.users[user].vote;
    if(userId === message.user) {
      // user has voted already
      if(existingVote === (voteOption - 1)) {
        // already voted for this
        bot.reply(message, '<@' + message.user + '>, you already voted for this option');
        return;
      }

      // changing their vote
      bot.reply(message, '<@' + message.user + '> has changed their vote from ' + currentPoll.options[existingVote] + ' to ' + currentPoll.options[voteOption - 1]);
      currentPoll.votes[existingVote] -= 1;
      currentPoll.votes[voteOption - 1] += 1;
      currentPoll.users[user].vote = voteOption - 1;

      if (checkForVoteMajority(currentPoll)) {
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
  bot.reply(message, '<@' + message.user + '>, your vote has been cast for ' + currentPoll.options[voteOption - 1]);
  currentPoll.votes[voteOption - 1] += 1;
  currentPoll.users.push({userId: message.user, vote: voteOption - 1});
  return;
}

function checkForVoteMajority(currentPoll) {
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
    var pollMapKey = createPollMapKey(message.user);
  } else {
    bot.reply(message, '<@' + message.user + '>, you already have an active poll: ' + polls[message.user].options.join(', '));
    return;
  }

  var nonZeroIndexPollMapKey = pollMapKey + 1;

  bot.reply(message, '<@' + message.user + '> has started a poll. `!vote ' + (nonZeroIndexPollMapKey) + ' <option>` for ' + polls[message.user].options.join(', ') + '. this poll will be open for 10 minutes');

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
  bot.reply(message, 'russell_bot version: ' + version);
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
