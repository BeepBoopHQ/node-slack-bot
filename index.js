var Botkit = require('botkit');
var firebaseStorage = require('botkit-storage-firebase')({firebase_uri: process.env.FirebaseUri});

// import commands
var cmds = require('./commands/commands');
var test = require('./statetest');

var token = process.env.SLACK_TOKEN;

var commands = {};

var polls = {};

var pollOptions = [];
var pollVotes = [];
var pollUsers = [];
var pollOwner = '';
var channelUsers = [];
var pollMap = {};

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false,
  storage: firebaseStorage
});

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    bot.say({
      text: 'russell_bot has connected',
      channel: 'C2ARE3TQU'
    });

    bot.say({
      text: 'running ' + cmds.replies.commandVersion(null, null),
      channel: 'C2ARE3TQU'
    });

    // run the poll timer
    setInterval(function() {
      for(key in polls) {
        if(polls.hasOwnProperty(key) && polls[key] !== null) {

          var currentTimeSeconds = new Date().getTime() / 1000;

          if (currentTimeSeconds - polls[key].startTime > (60 * 10)) { // if 10 minutes have passed
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

  //commands[command](bot, message, commandMsg);

  bot.reply(message, commands[command](message, commandMsg));
  return;
});

function createPollMapKey(userId) {
  for(key in pollMap) {
    if(pollMap.hasOwnProperty(key)) {
      if (pollMap[key] === null || pollMap[key] === undefined) {
        pollMap[key] = userId;
        return parseInt(key);
      }
    }
  }

  // add a new entry
  var newKey = Object.keys(pollMap).length;

  pollMap[newKey] = userId;
  return newKey;
}

function deletePollMapKey(userId) {
  for(key in pollMap) {
    if(pollMap.hasOwnProperty(key)) {
      if (pollMap[key] === userId) {
        pollMap[key] = null;
      }
    }
  }
}

function formatPollOptions(message) {
  if (message.indexOf(' or ') === -1) {
    pollOptions.push(message);
    var formattedOptions = pollOptions.map(function(e, i) {
      var formatted = '`' + e + '`';
      return [formatted];
    });
    pollOptions = [];

    return formattedOptions;
  } else {
    var option = message.substr(0, message.indexOf(' or '));
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

    polls[message.user] = {user: message.user, options: formattedPollChoices, votes: Array.apply(null, Array(formattedPollChoices.length)).map(Number.prototype.valueOf, 0), users: [], startTime: new Date().getTime() / 1000, channel: message.channel};
    var pollMapKey = createPollMapKey(message.user);
  } else {
    bot.reply(message, '<@' + message.user + '>, you already have an active poll: ' + polls[message.user].options.join(', '));
    return;
  }

  var nonZeroIndexPollMapKey = pollMapKey + 1;

  bot.reply(message, '<@' + message.user + '> has started a poll. `!vote ' + (nonZeroIndexPollMapKey) + ' <option>` for ' + polls[message.user].options.join(', ') + '. this poll will be open for 10 minutes');

  // // build the user list for majority vote
  // buildUserList(bot, message);

  return;
}

function clearPoll(user) {
  polls[user] = null;
}

function commandBug(bot, message, commandMsg) {
  // log this to #russel_bot as well
  bot.say({
    text: '<@' + message.user +'> has reported a bug: ' + commandMsg,
    channel: 'C2AVCAC6L'
  });

  bot.reply(message, 'thanks for your bug report. you can find it in #robo_russ');
  return;
}

function commandFlipCoin(bot, message, commandMsg) {

  if(commandMsg) {
    var side = commandMsg.split(' ')[0];

    if(side.toLowerCase() !== 'heads' && side.toLowerCase() !== 'tails') {
      bot.reply(message, 'side must be `heads` or `tails`');
      return;
    }

    var text = commandMsg.substr(commandMsg.indexOf(' ') + 1);

    if(!text) {
      bot.reply(message, 'cant leave the text blank!');
      return;
    }

    bot.reply(message, '<@' + message.user +'> is flipping a coin! if ' + side + ' then <@' + message.user + '> ' + text);
    
    var flip = (Math.floor(Math.random() * (2 - 1 + 1)) + 1);

    if(flip === 1) {
      bot.reply(message, 'It\'s *heads*! <@' + message.user + '> said: ' + text);
      return;
    }

    if(flip === 2) {
      bot.reply(message, 'It\'s *tails*! <@' + message.user + '> said: ' + text);
      return;
    }
  }

  bot.reply(message, '<@' + message.user + '> flipped a coin!');
  bot.reply(message, ((Math.floor(Math.random() * (2 - 1 + 1)) + 1) === 1 ? 'It\'s Heads!' : 'It\'s Tails!'));
  return;
}

function listCommands(bot, message, commandMsg) {
  var commandList = 'commands available: \r\n ```';

  for(var key in commands) {
    if (commands.hasOwnProperty(key)) {
      commandList += '!' + key + '\r\n';
    }
  }

  commandList += '```'

  bot.say({
    text: commandList,
    channel: message.channel
  });
  return;
}

function commandFeature(bot, message, commandMsg) {
  // log this to #russel_bot as well
  bot.say({
    text: '<@' + message.user +'> has requested a feature: ' + commandMsg,
    channel: 'C2BRPHPS4'
  });

  bot.reply(message, 'thanks for your feature request, <@' + message.user + '>');
  return;
}

function commandCeleryMan(bot, message, commandMsg) {
  // computer load up celery man
  bot.startConversation(message, function(err, convo) {
    convo.say('`Yes, Paul.`');
    convo.say('http://i.imgur.com/zSr6jEB.gif');
  });

  return;
}

function commandFaded(bot, message, commandMsg) {

  var responses = null;

  controller.storage.teams.get('faded', function(err, res) {
    if (err) {
      bot.reply(':ok_hand::ok_hand: _im faded fam_ :ok_hand::ok_hand:');
      return;
    }

    responses = res;

    // get ct - 1 (for id)
    var numResponses = Object.keys(responses).length - 1;

    if(commandMsg) {
      // save a message
      responses[numResponses] = commandMsg;

      saveFadedResponse(responses);

      bot.reply(message, ':ok_hand::ok_hand: _' + commandMsg + '_ :ok_hand::ok_hand:');

      return;
    }

    var num = Math.floor(Math.random() * (numResponses - 1 + 1)) + 1;

    bot.reply(message, ':ok_hand::ok_hand: _' + responses[num - 1] + '_ :ok_hand::ok_hand:');
    return;

  });
}

function saveFadedResponse(responses) {
  controller.storage.teams.save(responses);
}

function buildCommandDictionary() {
  // simple replies
  commands['berto'] = cmds.replies.commandBerto;
  commands['gohawks'] = cmds.replies.commandGoHawks;
  commands['russell'] = cmds.replies.commandRussell;
  commands['lit'] = cmds.replies.commandLit;
  commands['version'] = cmds.replies.commandVersion;
  commands['exbert'] = cmds.replies.commandExBert;
  commands['traphorns'] = cmds.replies.commandTrapHorns;
  commands['escalate'] = cmds.replies.commandEscalate;
  commands['blessup'] = cmds.replies.commandBlessUp;

  // games/random stuff
  commands['shot'] = cmds.shot.commandShot;
  commands['flipcoin'] = commandFlipCoin;

  // poll commands

  commands['poll'] = commandPoll;
  commands['vote'] = commandVote;
  commands['pollresults'] = commandPollResults;
  commands['endpoll'] = commandEndPoll;
  commands['resetpoll'] = commandResetPoll;

  // pokemans
  commands['ichooseyou'] = cmds.pokemon.commandIChooseYou;
  commands['pokemon'] = cmds.pokemon.commandPokemon;

  // football-related
  commands['matchup'] = cmds.matchups.commandMatchups;

  // cross-channel replies
  commands['feature'] = commandFeature;
  commands['bug'] = commandBug;

  // todo
  commands['celeryman'] = commandCeleryMan;
  commands['faded'] = commandFaded;
  
  // directory
  commands['commands'] = listCommands;

  // testing
  commands['testaddstate'] = test.addToArray;
  commands['testliststate'] = test.theArray;
}


