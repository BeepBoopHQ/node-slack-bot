var exports = module.exports = {};

// poll objs
var polls = {};
var pollOptions = [];
var pollMap = {};

// functions
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

// export obj
exports.commandPoll = function(message, args) {

    // args should have at least one ' or '
    if (args.indexOf(' or ') === -1 && pollOptions.length === 0) {
        return 'use `!poll <this> or <that>`';
    }

    // one poll per user
    if (polls[message.user]) {
        // user has a poll
        return `<@${message.user}>, you already have an active poll: ${polls[message.user].options.join(', ')}`;
    }

    // get formatted options
    var formattedPollChoices = formatPollOptions(args);

    // set new poll for this user
    polls[message.user] = {
        user: message.user,
        options: formattedPollChoices,
        votes: Array.apply(null, Array(formattedPollChoices.length)).map(Number.prototype.valueOf, 0),
        users: [], startTime: new Date().getTime() / 1000,
        channel: message.channel
    };

    // get a key for this poll
    var pollMapKey = createPollMapKey(message.user) + 1;

    return `<@${message.user}> has started a poll. \`!vote ${pollMapKey} <option>\` for ${polls[message.user].options.join(', ')}. this poll will be open for 10 minutes`;
}