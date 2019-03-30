const { WebClient } = require("@slack/web-api");
const { RTMClient } = require('@slack/rtm-api');
const cmds = require('./commands/commands');
const hiddenCmds = require('./commands/hiddenCommands');
const Message = require('./util/message/messageUtils');
const dbUtils = require('./util/db/dbUtils.js');
const version = require('../version');

// auto import .env file
require('dotenv').load();

// data cache
const appData = {};

// commands
let commands = {};
let hiddenCommands = {};

// message obj
let messageHandler;

let token = process.env.SLACK_TOKEN || '';
let rtm = new RTMClient(token, { loglevel: 'debug' });

let web = new WebClient(token);
let webAdmin = new WebClient(process.env.SLACK_ADMIN_TOKEN);

parseAndProcessCommand = (message) => {
  if (!message || !message.text) return;

  // does this message contain a hidden command
  let hiddenCommand = hiddenCmds.messageHasHiddenCommand(message.text);

  // not a ! command
  let parsedMessage = message.text.match(/^!(.*)\s?(.*)?$/);

  if ((!parsedMessage || parsedMessage.length < 2) && !hiddenCommand) return;

  if (!hiddenCommand) {

    let command = parsedMessage[1].toLowerCase();
    let commandMsg = '';
    
    // get the command and the arguments
    if (command.indexOf(' ') !== -1) {
      commandMsg = command.substr(command.indexOf(' ') + 1);
      command = command.substr(0, command.indexOf(' '));
    }

    // invalid command, ignore it
    if (!(command in commands)) {
      return;
    }

    // send a typing thing
    messageHandler.typing(message.channel);

    // get an array of responses
    let responses = commands[command](message, commandMsg, messageHandler);

    messageHandler.send(message, responses);

    // log use of this command if we need to
    if (responses && !responses[0].doNotLog) {
      dbUtils.logCommandUse(command, message.user);
    }

  } else {

    // check if there is a hidden command here
    if (!(hiddenCommand in hiddenCommands)) {
      return;
    }

    // send a typing thing
    messageHandler.typing(message.channel);

    // get an array of responses
    let responses = hiddenCommands[hiddenCommand](message);

    messageHandler.send(message, responses);
  }
}

shouldReadMessage = (message) => {
  // bot message or from myself
  if (isBotMessage(message) || message.user === appData.selfId) return false;

  return true;
}

function isBotMessage(message) {
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

  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      commandList += '!' + key + '\r\n';
    }
  }

  commandList += '```';

  return [{
    doNotLog: 1,
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
  commands['hypebeast'] = cmds.replies.commandHypeBeast;
  commands['goms'] = cmds.replies.commandGoMs;
  commands['honk'] = cmds.replies.honkForceEngage;
  commands['sc'] = cmds.replies.constructAdditionalPylons;

  // games/random stuff
  commands['shot'] = cmds.shot.commandShot;
  commands['flipcoin'] = cmds.replies.commandFlipCoin;
  commands['giphy'] = cmds.replies.updateGiphyScore;
  commands['giphyscore'] = cmds.replies.getGiphyScore;

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

  // admin
  commands['resetgiphy'] = cmds.admin.resetGiphyScore;

  // reactions
  commands['supreme'] = cmds.reactions.commandSupreme;

  // stats
  commands['stats'] = cmds.stats.getCommandStats;

  // hidden commands
  hiddenCommands['denzel'] = hiddenCmds.hiddenReplies.hiddenCommandMyBoyDenzel;
}

module.exports.startBot = () => {
  rtm.on('authenticated', (connectData) => {
    appData.selfId = connectData.self.id;
  });

  rtm.on('connected', () => {
    messageHandler = new Message(rtm, web, webAdmin, appData.selfId);

    messageHandler.send(null, [{
      doNotLog: 1,
      method: 'reply',
      message: {
        text: `connected: running \`${version.version}\``,
        channel: 'C2ARE3TQU'
      }
    }]);

    // start the poll timer
    setInterval(pollTimer, 10000);

    // build the commands
    buildCommandDictionary();
  });

  rtm.on('channel_joined', (message) => {
    rtm.sendMessage('#gohawks', message.channel);
  });

  rtm.on('message', (message) => {
    if (!shouldReadMessage(message)) return;

    parseAndProcessCommand(message);
  });

  rtm.start();
};
