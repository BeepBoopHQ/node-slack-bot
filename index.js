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

    var version = ''

    cmds.replies.commandVersion(null, null, function(res) {
      version = res[0].message.text;
    });

    bot.say({
      text: `running ${version}`,
      channel: 'C2ARE3TQU'
    });

    // run the poll timer
    setInterval(function() {
      var expiredPolls = cmds.poll.getExpiredPolls();

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

  // get the command and the arguments
  if (command.indexOf(' ') !== -1) {
    commandMsg = command.substr(command.indexOf(' ') + 1);
    command = command.substr(0, command.indexOf(' '));
  }

  // invalid command, ignore it
  if(!(command in commands)) {
    return;
  }

  // get an array of responses
  var responses = [];

  commands[command](message, commandMsg, function (resArray) {
    responses = resArray;
  
    if (!responses) return;

    console.log('about to respond, method ' + responses[0].method);

    for (var idx in responses) {
      
      // do the thing based on the bot reply method
      switch(responses[idx].method) {
        case 'reply':
          console.log(responses[idx].message.text);
          bot.reply(message, responses[idx].message.text);
          break;
        case 'say':
          console.log(responses[idx].message);
          bot.say(responses[idx].message);
          break;
        case 'convo':
          bot.startConversation(message, function(err, convo) {
            
            // iterate thru the conversation messages
            for (var msg in responses[idx].message.conversation) {
              convo.say(responses[idx].message.conversation[msg]);
            }
          });
          break;
        case 'custom':
          console.log(responses[idx].message);
          bot.reply(message, responses[idx].message);
          break;
      }
    }
  });
});

function listCommands(message, commandMsg, cb) {
  var commandList = 'commands available: \r\n ```';

  for(var key in commands) {
    if (commands.hasOwnProperty(key)) {
      commandList += '!' + key + '\r\n';
    }
  }

  commandList += '```'

  cb([{
    method: 'reply',
    message: {
      text: commandList
    }
  }]);
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
  commands['challengeaccepted'] = cmds.replies.commandChallengeAccepted;

  // games/random stuff
  commands['shot'] = cmds.shot.commandShot;
  commands['flipcoin'] = cmds.replies.commandFlipCoin;

  // poll commands
  commands['poll'] = cmds.poll.commandPoll;
  commands['vote'] = cmds.poll.commandVote;
  commands['pollresults'] = cmds.poll.commandPollResults;
  commands['endpoll'] = cmds.poll.commandEndPoll;
  commands['resetpoll'] = cmds.poll.commandResetPoll;
  commands['testpoll'] = cmds.poll.doTestPoll;

  // pokemans
  commands['ichooseyou'] = cmds.pokemon.commandIChooseYou;
  commands['pokemon'] = cmds.pokemon.commandPokemon;

  // football-related
  commands['matchup'] = cmds.matchups.commandDbMatchups;
  commands['newmatchup'] = cmds.matchups.commandInsertMatchup;

  // cross-channel replies
  commands['feature'] = cmds.replies.commandFeature;
  commands['bug'] = cmds.replies.commandBug;

  // todo
  commands['celeryman'] = cmds.replies.commandCeleryMan;
  
  // directory
  commands['commands'] = listCommands;
}


