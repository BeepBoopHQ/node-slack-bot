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

function deletePollMapKey(userId) {
  for(key in pollMap) {
    if(pollMap.hasOwnProperty(key)) {
      if (pollMap[key] === userId) {
        pollMap[key] = null;
      }
    }
  }
}

// export obj
exports.commandPoll = function(message, args, cb) {

    // args should have at least one ' or '
    if (args.indexOf(' or ') === -1 && pollOptions.length === 0) {
        cb([{
            method: 'reply',
            message: {
                text: 'use `!poll <this> or <that>`'
            }
        }]);
        return;
    }

    // one poll per user
    if (polls[message.user]) {
        // user has a poll
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, you already have an active poll: ${polls[message.user].options.join(', ')}`
            }
        }]);
        return;
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

    cb([{
        method: 'reply',
        message: {
            text: `<@${message.user}> has started a poll. \`!vote ${pollMapKey} <option>\` for ${polls[message.user].options.join(', ')}. this poll will be open for 10 minutes`
        }
    }]);
    return;
}

exports.commandVote = function(message, args, cb) {
    
    //we expect only 2 numbers in the args, one for the poll # and one for the vote option
    var pollNumber = parseInt(args.split(' ')[0]);
    var voteOption = parseInt(args.split(' ')[1]);

    if (isNaN(pollNumber) || isNaN(voteOption)) {
        cb([{
            method: 'reply',
            message: {
                text: 'your vote is invalid, use the number options to cast your vote: `!vote <poll number> <option number>`'
            }
        }]);
        return;
    }

    // get the poll from the poll map
    var pollUserId = pollMap[pollNumber - 1];
    var currentPoll = polls[pollUserId];

    // check if the poll exists
    if (!currentPoll || pollNumber <= 0) {
        cb([{
            method: 'reply',
            message : {
                text: `${pollNumber} is not a valid poll`
            }
        }]);
        return;
    }

    // check for valid vote
    if (voteOption <= 0 || voteOption > currentPoll.options.length) {
        cb([{
            method: 'reply',
            message: {
                text: `${voteOption} is not a valid poll option`
            }
        }]);
        return;
    }

    // try and do the vote
    for (user in currentPoll.users) {
        var userId = currentPoll.users[user].userId;
        var existingVote = currentPoll.users[user].vote;

        // check for an existing vote
        if (userId === message.user) {
            
            // check and see if this is the same vote option
            if (existingVote === (voteOption - 1)) {
                cb([{
                    method: 'reply',
                    message: {
                        text: `<@${message.user}>, you have already voted for this option`
                    }
                }]);
                return;
            }

            // user wants to change their vote
            currentPoll.votes[existingVote] -= 1;
            currentPoll.votes[voteOption - 1] += 1;
            currentPoll.votes[user].vote = voteOption - 1;

            cb([{
                method: 'reply',
                message: {
                    text: `<@${message.user}> has changed their vote from ${currentPoll.options[existingVote]} to ${currentPoll.options[voteOption - 1]}`
                }
            }]);
            return;
        }
    }

    // this user hasn't voted yet
    currentPoll.votes[voteOption - 1] += 1;
    currentPoll.users.push({
        userId: message.user,
        vote: (voteOption - 1)
    });

    cb([{
        method: 'reply',
        message: {
            text: `<@${message.user}>, your vote has been cast for ${currentPoll.options[voteOption - 1]}`
        }
    }]);
    return;
}

exports.commandEndPoll = function(message, args, cb) {

    // validate poll number
    var pollNumber = parseInt(args.split(' ')[0]);

    if (isNaN(pollNumber)) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this is an invalid poll`
            }
        }]);
        return;
    }

    if (!pollMap[pollNumber - 1]) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this poll does not exist`
            }
        }]);
        return;
    }

    var pollUserId = pollMap[pollNumber - 1];
    var currentPoll = polls[pollUserId];

    // check if this user owns this poll
    if (currentPoll.user !== message.user) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, only <@${currentPoll.user}> can end this poll`
            }
        }]);
        return;
    }

    // generate poll results
    var resultsArray = currentPoll.options.map(function(e, i) {
        var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + currentPoll.votes[i] + '`';
        return [formatted];
    });

    polls[pollUserId] = null;
    deletePollMapKey(pollUserId);
    cb([{
        method: 'reply',
        message: {
            text: `<@${currentPoll.user}>'s poll is closed. results are: ${resultsArray.join(', ')}`
        }
    }]);
    return;
};

exports.commandPollResults = function(message, args, cb) {

    // validate
    var pollNumber = parseInt(args.split(' ')[0]);

    if (isNaN(pollNumber)) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this is an invalid poll`
            }
        }]);
        return;
    }

    if (!pollMap[pollNumber - 1]) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this poll does not exist`
            }
        }]);
        return;
    }

    var pollUserId = pollMap[pollNumber - 1];
    var currentPoll = polls[pollUserId];

    // check if there are no votes
    if (!currentPoll.options || currentPoll.options.length < 1) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, there are no votes for this poll yet`
            }
        }]);
        return;
    }

    var resultsArray = currentPoll.options.map(function(e, i) {
        var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + currentPoll.votes[i] + '`';
        return [formatted];
    });

    cb([{
        method: 'reply',
        message: {
            text: `<@${message.user}>, this poll's results are: ${resultsArray.join(', ')}`
        }
    }]);
    return;
}

exports.commandResetPoll = function(message, args, cb) {

    // validate
    var pollNumber = parseInt(args.split(' ')[0]);

    if (isNaN(pollNumber)) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this is an invalid poll`
            }
        }]);
        return;
    }

    if (!pollMap[pollNumber - 1]) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this poll does not exist`
            }
        }]);
        return;
    }

    var pollUserId = pollMap[pollNumber - 1];
    var currentPoll = polls[pollUserId];

    // check if this user owns this poll
    if (currentPoll.user !== message.user) {
        cb([{
            method: 'reply',
            message: {
                text: `<@${message.user}>, only <@${currentPoll.user}> can reset this poll`
            }
        }]);
        return;
    }

    var resultsArray = currentPoll.options.map(function(e, i) {
        var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + polls[key].votes[i] + '`';
        return [formatted];
    });

    polls[pollUserId].votes = Array.apply(null, Array(polls[pollUserId].options.length));
    polls[pollUserId].users = [];
    
    cb([{
        method: 'reply',
        message: {
            text: `<@${message.user}> has reset their poll. \`!vote\` again`
        }
    }]);
    return;
}

exports.getExpiredPolls = function() {
    var expiredPolls = [];
    for(key in polls) {
        if(polls.hasOwnProperty(key) && polls[key] !== null) {

            var currentTimeSeconds = new Date().getTime() / 1000;

            if (currentTimeSeconds - polls[key].startTime > (60 * 10)) { // if 10 minutes have passed
                var resultsArray = polls[key].options.map(function(e, i) {
                    var formatted =  '`' + e[0].replace(/`/g, '') + ': ' + polls[key].votes[i] + '`';
                    return [formatted];
                });

                expiredPolls.push({
                    user: key,
                    results: resultsArray.join(', '),
                    channel: polls[key].channel
                });

                polls[key] = null;
                deletePollMapKey(key);
            }
        }
    }

    cb([{
        method: 'reply',
        message: {
            text: expiredPolls
        }
    }]);
    return;
}