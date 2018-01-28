// poll objs
let polls = {};
let pollOptions = [];
let pollMap = {};

// functions
function formatPollOptions(message) {
  if (message.indexOf(' or ') === -1) {
    pollOptions.push(message);
    let formattedOptions = pollOptions.map(function(e, i) {
      let formatted = '`' + e + '`';
      return [formatted];
    });
    pollOptions = [];

    return formattedOptions;
  } else {
    let option = message.substr(0, message.indexOf(' or '));
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
  let newKey = Object.keys(pollMap).length;

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
module.exports.commandPoll = function(message, args) {

    // args should have at least one ' or '
    if (args.indexOf(' or ') === -1 && pollOptions.length === 0) {
        return [{
            message: {
                text: 'use `!poll <this> or <that>`'
            }
        }];
    }

    // one poll per user
    if (polls[message.user]) {
        // user has a poll
        return [{
            message: {
                text: `<@${message.user}>, you already have an active poll: ${polls[message.user].options.join(', ')}`
            }
        }];
    }

    // get formatted options
    let formattedPollChoices = formatPollOptions(args);

    // set new poll for this user
    polls[message.user] = {
        user: message.user,
        options: formattedPollChoices,
        votes: Array.apply(null, Array(formattedPollChoices.length)).map(Number.prototype.valueOf, 0),
        users: [], startTime: new Date().getTime() / 1000,
        channel: message.channel
    };

    // get a key for this poll
    let pollMapKey = createPollMapKey(message.user) + 1;

    return[{
        method: 'reply',
        message: {
            text: `<@${message.user}> has started a poll. \`!vote ${pollMapKey} <option>\` for ${polls[message.user].options.join(', ')}. this poll will be open for 10 minutes`
        }
    }];
}

module.exports.commandVote = function(message, args) {
    
    //we expect only 2 numbers in the args, one for the poll # and one for the vote option
    let pollNumber = parseInt(args.split(' ')[0]);
    let voteOption = parseInt(args.split(' ')[1]);

    if (isNaN(pollNumber) || isNaN(voteOption)) {
        return [{
            method: 'reply',
            message: {
                text: 'your vote is invalid, use the number options to cast your vote: `!vote <poll number> <option number>`'
            }
        }];
    }

    // get the poll from the poll map
    let pollUserId = pollMap[pollNumber - 1];
    let currentPoll = polls[pollUserId];

    // check if the poll exists
    if (!currentPoll || pollNumber <= 0) {
        return [{
            method: 'reply',
            message : {
                text: `${pollNumber} is not a valid poll`
            }
        }];
    }

    // check for valid vote
    if (voteOption <= 0 || voteOption > currentPoll.options.length) {
        return [{
            method: 'reply',
            message: {
                text: `${voteOption} is not a valid poll option`
            }
        }];
    }

    // try and do the vote
    for (user in currentPoll.users) {
        let userId = currentPoll.users[user].userId;
        let existingVote = currentPoll.users[user].vote;

        // check for an existing vote
        if (userId === message.user) {
            console.log(existingVote);
            console.log(voteOption - 1);


            // check and see if this is the same vote option
            if (existingVote === (voteOption - 1)) {
                return [{
                    method: 'reply',
                    message: {
                        text: `<@${message.user}>, you have already voted for this option`
                    }
                }];
            }

            // user wants to change their vote
            currentPoll.votes[existingVote] -= 1;
            currentPoll.votes[voteOption - 1] += 1;
            currentPoll.users[user].vote = voteOption - 1;

            return [{
                method: 'reply',
                message: {
                    text: `<@${message.user}> has changed their vote from ${currentPoll.options[existingVote]} to ${currentPoll.options[voteOption - 1]}`
                }
            }];
        }
    }

    // this user hasn't voted yet
    currentPoll.votes[voteOption - 1] += 1;
    currentPoll.users.push({
        userId: message.user,
        vote: (voteOption - 1)
    });

    return [{
        method: 'reply',
        message: {
            text: `<@${message.user}>, your vote has been cast for ${currentPoll.options[voteOption - 1]}`
        }
    }];
}

module.exports.commandEndPoll = function(message, args) {

    // validate poll number
    let pollNumber = parseInt(args.split(' ')[0]);

    if (isNaN(pollNumber)) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this is an invalid poll`
            }
        }];
    }

    if (!pollMap[pollNumber - 1]) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this poll does not exist`
            }
        }];
    }

    let pollUserId = pollMap[pollNumber - 1];
    let currentPoll = polls[pollUserId];

    // check if this user owns this poll
    if (currentPoll.user !== message.user) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, only <@${currentPoll.user}> can end this poll`
            }
        }];
    }

    // generate poll results
    let resultsArray = currentPoll.options.map(function(e, i) {
        let formatted =  '`' + e[0].replace(/`/g, '') + ': ' + currentPoll.votes[i] + '`';
        return [formatted];
    });

    polls[pollUserId] = null;
    deletePollMapKey(pollUserId);
    return [{
        method: 'reply',
        message: {
            text: `<@${currentPoll.user}>'s poll is closed. results are: ${resultsArray.join(', ')}`
        }
    }];
};

module.exports.commandPollResults = function(message, args, cb) {

    // validate
    let pollNumber = parseInt(args.split(' ')[0]);

    if (isNaN(pollNumber)) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this is an invalid poll`
            }
        }];
    }

    if (!pollMap[pollNumber - 1]) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this poll does not exist`
            }
        }];
    }

    let pollUserId = pollMap[pollNumber - 1];
    let currentPoll = polls[pollUserId];

    // check if there are no votes
    if (!currentPoll.options || currentPoll.options.length < 1) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, there are no votes for this poll yet`
            }
        }];
    }

    let resultsArray = currentPoll.options.map(function(e, i) {
        let formatted =  '`' + e[0].replace(/`/g, '') + ': ' + currentPoll.votes[i] + '`';
        return [formatted];
    });

    return [{
        method: 'reply',
        message: {
            text: `<@${message.user}>, this poll's results are: ${resultsArray.join(', ')}`
        }
    }];
}

module.exports.commandResetPoll = function(message, args, cb) {

    // validate
    let pollNumber = parseInt(args.split(' ')[0]);

    if (isNaN(pollNumber)) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this is an invalid poll`
            }
        }];
    }

    if (!pollMap[pollNumber - 1]) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, this poll does not exist`
            }
        }];
    }

    let pollUserId = pollMap[pollNumber - 1];
    let currentPoll = polls[pollUserId];

    // check if this user owns this poll
    if (currentPoll.user !== message.user) {
        return [{
            method: 'reply',
            message: {
                text: `<@${message.user}>, only <@${currentPoll.user}> can reset this poll`
            }
        }];
    }

    let resultsArray = currentPoll.options.map(function(e, i) {
        let formatted =  '`' + e[0].replace(/`/g, '') + ': ' + polls[key].votes[i] + '`';
        return [formatted];
    });

    polls[pollUserId].votes = Array.apply(null, Array(polls[pollUserId].options.length));
    polls[pollUserId].users = [];
    
    return [{
        method: 'reply',
        message: {
            text: `<@${message.user}> has reset their poll. \`!vote\` again`
        }
    }];
}

module.exports.getExpiredPolls = function() {
    let expiredPolls = [];
    for(key in polls) {
        if(polls.hasOwnProperty(key) && polls[key] !== null) {

            let currentTimeSeconds = new Date().getTime() / 1000;

            if (currentTimeSeconds - polls[key].startTime > (60 * 10)) { // if 10 minutes have passed
                let resultsArray = polls[key].options.map(function(e, i) {
                    let formatted =  '`' + e[0].replace(/`/g, '') + ': ' + polls[key].votes[i] + '`';
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

    return expiredPolls;
}

module.exports.doTestPoll = function(message, args, cb) {
    return [{
        method: 'custom',
        message: {
            text: 'This is a test poll',
            attachments: [
                {
                    fallback: 'Fallback text',
                    callback_id: 'poll_1_cb',
                    attachment_type: 'default',
                    title: 'Poll title?',
                    text: 'Poll text?',
                    actions: [
                        {
                            name: 'Option 1',
                            text: 'Option 1',
                            type: 'button',
                            value: 'Option 1'
                        },
                        {
                            name: 'Option 2',
                            text: 'Option 2',
                            type: 'button',
                            value: 'Option 2'
                        },
                        {
                            name: 'Option 3',
                            text: 'Option 3',
                            type: 'button',
                            value: 'Option 3'
                        }
                    ]
                }
            ]
        }
    }];
}

