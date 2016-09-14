var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var commands = {};

var pollOptions = [];
var pollVotes = [];
var pollUsers = [];
var pollOwner = '';

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

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

// build the command dictionary
buildCommandDictionary();

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "#gohawks")
})

// controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
//   bot.reply(message, 'Hello.')
// })
//
// controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
//   bot.reply(message, 'Hello.')
//   bot.reply(message, 'It\'s nice to talk to you directly.')
// })
//
// controller.hears('.*', ['mention'], function (bot, message) {
//   bot.reply(message, 'You really do care about me. :heart:')
// })
//
// controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
//   var help = 'I will respond to the following messages: \n' +
//       '`bot hi` for a simple message.\n' +
//       '`bot attachment` to see a Slack attachment message.\n' +
//       '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
//       '`bot help` to see this again.'
//   bot.reply(message, help)
// })
//
// controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
//   var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
//   var attachments = [{
//     fallback: text,
//     pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
//     title: 'Host, deploy and share your bot in seconds.',
//     image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
//     title_link: 'https://beepboophq.com/',
//     text: text,
//     color: '#7CD197'
//   }]
//
//   bot.reply(message, {
//     attachments: attachments
//   }, function (err, resp) {
//     console.log(err, resp)
//   })
// })
//
// controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
//   bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
// })

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

  var response = commands[command]();

  if (command === 'bug') {
    // log this to #russel_bot as well
    bot.say({
      text: "a bug has been reported: " + commandMsg,
      channel: "C2AVCAC6L"
    });

    bot.reply(message, "thanks for your bug report. you can find it in #robo_russ");
    return;
  }

  if (command === 'poll') {

    if (pollOptions.length !== 0) {
      bot.reply(message, 'another poll is already active.');
      var formattedOptions = pollOptions.map(function(opt) {
        return '`' + opt + '`'
      });

      bot.reply(message, '`!vote` for ' + pollOptions.join(', '));
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

    bot.reply(message, 'a poll has been started! `!vote` for ' + pollOptions.join(', '));
    pollOwner = message.user;
    pollVotes = Array.apply(null, Array(pollOptions.length)).map(Number.prototype.valueOf, 0);
    return;

  }

  if (command === 'vote') {

    if (pollOptions.length === 0) {
      bot.reply(message, 'there is no active poll, use `!poll <this> or <that>` to start your own');
      return;
    }

    if (pollUsers.indexOf(message.user) !== -1) {
      // already voted
      bot.reply(message, '<@' + message.user + '>, you have already voted in this poll');
      return;
    }

    var optionIndex = parseInt(commandMsg);

    if (isNaN(optionIndex) || optionIndex  > pollVotes.length || optionIndex <= 0) {
      bot.reply(message, 'your vote is invalid, use the number option to cast your vote: `!vote 1`');
      return;
    }

    pollVotes[optionIndex - 1] += 1;
    bot.reply(message, '<@' + message.user + '>, your vote has been cast for `' + pollOptions[optionIndex - 1] + '`');
    pollVotes.push(message.user);
    return;

  }

  if (command === 'results') {
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

  if (command === 'endpoll') {

    if (message.user !== pollOwner) {
      bot.reply(message, 'only <@' + pollOwner + '> can close this poll');
      bot.reply(message, {
        text: 'only <@' + pollOwner + '> can close this poll'
      });
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
    pollOwner = ''

    return;

  }

  bot.reply(message, response);
});

function getPollOptions(message) {
  if (message.indexOf(' or ') === -1) {
    pollOptions.push(message);
    console.log("got these options: " + pollOptions);
    return pollOptions;
  } else {
    var option = message.substr(0, message.indexOf(' or '));
    pollOptions.push(option);
    getPollOptions(message.substr(message.indexOf(' or ') + 4));
  }
}

function commandBerto() {
  return generateStaticMessage('ayo berto :100:');
}

function commandGoHawks() {
  return generateStaticMessage('#gohawks');
}

function commandRussell() {
  return generateStaticMessage('`beep boop i am russell_bot`');
}

function commandFlipCoin() {
  return (Math.floor(Math.random() * (2 - 1 + 1)) + 1) === 1 ? 'Heads!' : 'Tails!';
}

function commandDoNothing() {
  return '';
}

function showVersion() {
  return generateStaticMessage('russell_bot version: `v1.1 \'berto\'`');
}

function generateStaticMessage(message) {
  return message;
}

function listCommands() {
  var message = "commands available: ";

  for(var key in commands) {
    if (commands.hasOwnProperty(key)) {
      message += '`!' + key + '` ';
    }
  }

  return message;
}

function buildCommandDictionary() {
  commands["berto"] = commandBerto;
  commands["gohawks"] = commandGoHawks;
  commands["russell"] = commandRussell;
  commands["flipcoin"] = commandFlipCoin;
  commands["bug"] = commandDoNothing;
  commands["version"] = showVersion;
  commands["poll"] = commandDoNothing;
  commands["vote"] = commandDoNothing;
  commands["results"] = commandDoNothing;
  commands["endpoll"] = commandDoNothing;
  commands["commands"] = listCommands;
}
