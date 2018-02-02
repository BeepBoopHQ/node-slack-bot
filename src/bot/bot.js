const { RtmClient, RTM_EVENTS, CLIENT_EVENTS, WebClient } = require('@slack/client');
const cmds = require('./commands/commands');
const version = require('../version');

// auto import .env file
require('dotenv').load();

// data cache
const appData = {};

// commands
let commands = {};

let token = process.env.SLACK_TOKEN || '';
let rtm = new RtmClient(token, { loglevel: 'debug' });

let web = new WebClient(token);

parseAndProcessCommand = (message) => {

    // not a ! command
  let parsedMessage = message.text.match(/^!(.*)\s?(.*)?$/);

  if (!parsedMessage || parsedMessage.length < 2) return;

  let command = parsedMessage[1].toLowerCase();
  let commandMsg = '';

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
  let responses = commands[command](message, commandMsg);

  for (let idx in responses) {

    let channel = responses[idx].message.channel ? responses[idx].message.channel : message.channel;

    if (responses[idx].type === 'custom') {
      let opts = responses[idx].message;

      opts.bot_id = appData.selfId;
      opts.type = 'message';
      opts.subtype = 'bot_message';
      opts.as_user = false;

      web.chat.postMessage(channel, responses[idx].message.text, opts);

      break;
    }

    rtm.sendMessage(responses[idx].message.text, channel);
  }
}

shouldReadMessage = (message) => {

  // bot message or from myself
  if (isBotMessage(message) || message.user === appData.selfId) return false;

  return true;
}

isBotMessage = (message) => {
  return message.subtype && message.subtype === 'bot_message';
}

pollTimer = () => {
  let expiredPolls = cmds.poll.getExpiredPolls();

  if (expiredPolls && expiredPolls.length > 0) {
    for (let poll in expiredPolls) {
      rtm.sendMessage(`<@${expiredPolls[poll].user}>'s poll has ended. results are: ${expiredPolls[poll].results}`, expiredPolls[poll].channel);
    }
  }
}

listCommands = (message, commandMsg) => {
  let commandList = 'commands available: \r\n ```';

  for(let key in commands) {
    if (commands.hasOwnProperty(key)) {
      commandList += '!' + key + '\r\n';
    }
  }

  commandList += '```'

  return [{
    method: 'reply',
    message: {
      text: commandList
    }
  }];
}

buildCommandDictionary = () => {
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
  commands['lgrw'] = cmds.replies.commandLGRW;

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

  // cross-channel replies
  commands['feature'] = cmds.replies.commandFeature;
  commands['bug'] = cmds.replies.commandBug;

  // todo
  commands['celeryman'] = cmds.replies.commandCeleryMan;
  
  // directory
  commands['commands'] = listCommands;

  // sql test
  commands['testdb'] = cmds.replies.commandTestDb;
}

module.exports.startBot = () => {
  rtm.on(RTM_EVENTS.AUTHENTICATED, (connectData) => {
    appData.selfId = connectData.self.id;
  });

  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    rtm.sendMessage('russell_bot has connected', 'C2ARE3TQU');
    rtm.sendMessage(`running \`${version.version}\``, 'C2ARE3TQU');

    // start the poll timer
    setInterval(pollTimer, 10000);

    // build the commands
    buildCommandDictionary();
  });

  rtm.on(RTM_EVENTS.CHANNEL_JOINED, (message) => {
    rtm.sendMessage('#gohawks', message.channel);
  });

  rtm.on(RTM_EVENTS.MESSAGE, (message) => {

    if (!shouldReadMessage(message)) return;

    parseAndProcessCommand(message)
  });

  rtm.start();
}