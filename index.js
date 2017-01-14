var Botkit = require('botkit');
var firebaseStorage = require('botkit-storage-firebase')({firebase_uri: process.env.FirebaseUri});

var token = process.env.SLACK_TOKEN;
var version = '`v2.0 \'chef boyarberto\'`';

var commands = {};

var polls = {};

var pollOptions = [];
var pollVotes = [];
var pollUsers = [];
var pollOwner = '';
var channelUsers = [];
var pollMap = {};

var pokemonList = [
  {name: 'pidgeot', img: 'http://media-cerulean.cursecdn.com/avatars/274/719/018_00.png' },
  {name: 'mewtwo', img: 'http://pkmn.net/sprites/blackwhite/front/150.png' },
  {name: 'arcanine', img: 'https://i.dstatic.com/images/pokemon/front/normal/arcanine.png' },
  {name: 'poliwrath', img: 'https://urpgstatic.com/img_library/pokemon_sprites/062.png' },
  {name: 'victreebel', img: 'http://pokedream.com/pokedex/images/blackwhite/front/071.png' },
  {name: 'ampharos', img: 'https://media.pocketmonsters.net/dex//5/bw/181.png' },
  {name: 'squirtle', img: 'http://pokedream.com/pokedex/images/blackwhite/front-alt/007.png' },
  {name: 'lugia', img: 'http://pokedream.com/pokedex/images/blackwhite/front-alt/249.png' },
  {name: 'wigglytuff', img: 'https://i.dstatic.com/images/pokemon/front/normal/wigglytuff.png' },
  {name: 'bulbasaur', img: 'https://i.dstatic.com/images/pokemon/front/retro/bulbasaur.png' },
  {name: 'gengar', img: 'http://cdn.bulbagarden.net/upload/2/21/Spr_5b_094.png'}
];

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

function commandShot(bot, message, commandMsg) {
  // get the user and get the number
  var user = commandMsg.split(' ')[0];
  var number = parseInt(commandMsg.split(' ')[1]);

  if (!user || !number) {
    bot.reply(message, 'use `!shot <person> <number>`');
    return;
  }

  if (number < 0 || number > 20) {
    bot.reply(message, 'use a number between 1 and 20`');
    return;
  }

  var roll = Math.floor(Math.random() * (20 - 1 + 1)) + 1;

  if(roll === 1) {
    bot.reply(message, 'you rolled a *' + roll + '*, <@' + message.user + '>, you have to take a shot!');
  } else if (roll === number || roll === 20) {
    bot.reply(message, 'you rolled a *' + roll + '*, success! ' + user + ' has to take a shot!');
  } else {
    bot.reply(message, 'you rolled a *' + roll + '*, too bad!');
  }

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

  bot.reply(message, 'thanks for your feature request, <@' + message.user + '>');
  return;
}

function commandExbert(bot, message, commandMsg) {
  // lol
  bot.reply(message, '<@U2ASHP5FT>, <@' + message.user + '> needs an exbert: ' + commandMsg);
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

function commandTrapHorns(bot, message, commandMsg) {
  bot.reply(message, 'https://www.youtube.com/watch?v=Ip1SYl97kh4 :trumpet::trumpet::trumpet::trumpet:');
  return;
}

function commandEscalate(bot, message, commandMsg) {
  if (message.user !== "U2ARFPF62") {
    bot.reply(message, 'Thanks for your ticket, an associate will be with you shortly.');
    return;
  }

  bot.reply(message, '<@U2ASHP5FT> :fire::fire: [HIGH PRIORITY] :fire::fire: ' + commandMsg + ' :fire::fire: [HIGH PRIORITY] :fire::fire:');
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

function commandIChooseYou(bot, message, commandMsg) {
  // ok so you say a pokeman and if it matches it shows a badass pic of the pokemon
  var foundPokemon = false;

  for (i in pokemonList) {
    if(pokemonList[i].name.toLowerCase() === commandMsg.toLowerCase()) {
      var reply = {
        "username": "Professor Oak",
	      "icon_url": "http://66.media.tumblr.com/avatar_560e9f72e0bf_128.png",
	      "attachments": [
          {
            "fallback": "<@" + message.user + "> chooses " + pokemonList[i].name + "!",
            "text": "<@" + message.user + "> chooses " + pokemonList[i].name + "!",
            "image_url": pokemonList[i].img
          }
        ]
      };

      bot.reply(message, reply);
      return;
    }
  }

  var reply = {
    'username': 'Professor Oak',
    "icon_url": "http://66.media.tumblr.com/avatar_560e9f72e0bf_128.png",
    'text': '<@' + message.user +'>, no such pokemon! use `!pokemon`'
  };

    bot.reply(message, reply);
    return;
}

function commandPokemon(bot, message, commandMsg) {
  // list the pkmn

  var reply = {
    'username': 'Professor Oak',
    "icon_url": "http://66.media.tumblr.com/avatar_560e9f72e0bf_128.png",
    'text': 'here are the pokemon at your disposal! use `!ichooseyou <pokemon>`!\n```'
  };

  for (i in pokemonList) {
    reply.text += pokemonList[i].name + '\n';
  }

  reply.text += '```';

  bot.reply(message, reply);
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
  commands['exbert'] = commandExbert;
  commands['celeryman'] = commandCeleryMan;
  commands['traphorns'] = commandTrapHorns;
  commands['shot'] = commandShot;
  commands['faded'] = commandFaded;
  commands['escalate'] = commandEscalate;
  commands['ichooseyou'] = commandIChooseYou;
  commands['pokemon'] = commandPokemon;
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
