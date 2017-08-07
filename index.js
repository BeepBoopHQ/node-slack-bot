var Botkit = require('botkit');
var firebaseStorage = require('botkit-storage-firebase')({firebase_uri: process.env.FirebaseUri});

// import commands
var cmds = require('./commands/commands');

var token = process.env.SLACK_TOKEN;

// command list
var commands = {};

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
      var expiredPolls = cmd.poll.getExpiredPolls();

      if (expiredPolls && expiredPolls.length > 0) {
        for (var poll in expiredPolls) {
          bot.say({
            text: `<@${expiredPolls[poll].user}>'s poll has ended. results are: ${expiredPolls[poll].results}`,
            channel: expiredPolls[poll].channel
          });
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
  commands['poll'] = cmds.poll.commandPoll;
  commands['vote'] = cmds.poll.commandVote;
  commands['pollresults'] = cmds.poll.pollresults;
  commands['endpoll'] = cmds.poll.commandEndPoll;
  commands['resetpoll'] = cmds.poll.resetpoll;

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
}


