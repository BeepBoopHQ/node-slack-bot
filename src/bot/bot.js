const { RtmClient, RTM_EVENTS, CLIENT_EVENTS, WebClient } = require('@slack/client');
const cmds = require('./commands/commands');
const version = require('../version');
const Message = require('./util/message/messageUtils');

// auto import .env file
require('dotenv').load();

// data cache
const appData = {};

// commands
let commands = {};

// message obj
let messageHandler;

let token = process.env.SLACK_TOKEN || '';
let rtm = new RtmClient(token, { loglevel: 'debug' });

let web = new WebClient(token);
let webAdmin = new WebClient(process.env.SLACK_ADMIN_TOKEN);

function parseAndProcessCommand(message) {
  if (!message || !message.text) return;

  // check if the user is banned first
  if (cmds.admin.isUserBanned(message.user)) {
    // delete message
    messageHandler.delete(message.ts, message.channel);
    return;
  }

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
  if (!(command in commands)) {
    return;
  }

  // send a typing thing
  messageHandler.typing(message.channel);

  // get an array of responses
  let responses = commands[command](message, commandMsg, messageHandler);

  messageHandler.send(message, responses);
}

function shouldReadMessage(message) {
  // bot message or from myself
  if (isBotMessage(message) || message.user === appData.selfId) return false;

  return true;
}

function isBotMessage(message) {
  return message.subtype && message.subtype === 'bot_message';
}

function pollTimer() {
  let expiredPolls = cmds.poll.getExpiredPolls();

  if (expiredPolls && expiredPolls.length > 0) {
    for (let poll in expiredPolls) {
      rtm.sendMessage(`<@${expiredPolls[poll].user}>'s poll has ended. results are: ${expiredPolls[poll].results}`, expiredPolls[poll].channel);
    }
  }
}

function banTimer() {
  cmds.admin.checkBans();
}

function listCommands(message, commandMsg) {
  let commandList = 'commands available: \r\n ```';

  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      commandList += '!' + key + '\r\n';
    }
  }

  commandList += '```';

  return [{
    method: 'reply',
    message: {
      text: commandList
    }
  }];
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
  commands['lgrw'] = cmds.replies.commandLGRW;
  commands['hypebeast'] = cmds.replies.commandHypeBeast;
  commands['goms'] = cmds.replies.commandGoMs;

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
  commands['ban'] = cmds.admin.commandBan;
  commands['unban'] = cmds.admin.commandUnban;
  commands['resetgiphy'] = cmds.admin.resetGiphyScore;

  // reactions
  commands['supreme'] = cmds.reactions.commandSupreme;

  // sql test
  // commands['testdb'] = cmds.replies.commandTestDb;
  // commands['testdbpoll'] = cmds.replies.commandTestDbPoll;
  // commands['testaddpolloption'] = cmds.replies.commandTestAddPollOption;
  // commands['testaddpollvote'] = cmds.replies.commandTestAddPollVote;
  // commands['testgetpollresults'] = cmds.replies.commandTestPollResults;
  // commands['testendpoll'] = cmds.replies.commandEndPoll;
}

module.exports.startBot = () => {
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
    appData.selfId = connectData.self.id;
  });

  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    messageHandler = new Message(rtm, web, webAdmin, appData.selfId);

    // start the poll timer
    setInterval(pollTimer, 10000);

    // set ban timer
    setInterval(banTimer, 10000);

    // build the commands
    buildCommandDictionary();
  });

  rtm.on(RTM_EVENTS.CHANNEL_JOINED, (message) => {
    rtm.sendMessage('#gohawks', message.channel);
  });

  rtm.on(RTM_EVENTS.MESSAGE, (message) => {
    if (!shouldReadMessage(message)) return;

    parseAndProcessCommand(message);
  });

  rtm.start();
};
