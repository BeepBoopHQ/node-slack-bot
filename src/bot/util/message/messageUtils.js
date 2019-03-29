class Message{
  constructor(rtm, web, webAdmin, selfId) {
    this.rtm = rtm;
    this.web = web;
    this.webAdmin = webAdmin;
    this.selfId = selfId;

    this.send = (message, responses) => {
      if (!responses || responses.length <= 0) return;

      for (let idx in responses) {
        if (responses[idx].type === 'reaction') return doReactionCommand(this.web, message, responses);

        let channel = responses[idx].message.channel ? responses[idx].message.channel : message.channel;

        if (responses[idx].type === 'custom') {
          let opts = responses[idx].message;

          opts.bot_id = this.selfId;
          opts.type = 'message';
          opts.subtype = 'bot_message';
          opts.as_user = false;

          if (responses[idx].message.thread_ts) {
            opts.thread_ts = responses[idx].message.thread_ts;
          }

          this.web.chat.postMessage(channel, responses[idx].message.text, opts);
          continue;
        }

        this.rtm.sendMessage(responses[idx].message.text, channel);
      }
    }

    this.typing = (channel) => {
      this.rtm.sendTyping(channel);
    }

    this.delete = (ts, channel) => {
      this.webAdmin.chat.delete(ts, channel);
    }
  }
}

doReactionCommand = (web, message, responses) => {
  
  if (!responses || !responses.length) return;

  // get a list of reactions first
  web.reactions.get({
    channel: message.channel,
    timestamp: responses[0].timestamp
  }).then((res) => {
    doAddReaction(res.message.reactions, web, message, responses);
  });
}

doAddReaction = (reactions, web, message, responses) => {
  if (!responses || responses.length === 0) return;

  var reactionToAdd = responses[0].reaction;

  if (reactions && reactions.find(r => r.name === reactionToAdd)) return;

  web.reactions.add(responses[0].reaction, {
    channel: message.channel,
    timestamp: responses[0].timestamp
  }).then((res) => {
    doAddReaction(reactions, web, message, responses.slice(1));
  });
}

module.exports = Message;