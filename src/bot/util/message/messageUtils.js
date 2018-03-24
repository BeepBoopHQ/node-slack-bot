function Message(rtm, web, webAdmin, selfId) {
  this.rtm = rtm;
  this.web = web;
  this.webAdmin = webAdmin;
  this.selfId = selfId;

  this.send = (message, responses) => {
    if (!responses || responses.length <= 0) return;

    for (let idx in responses) {
      let channel = responses[idx].message.channel ? responses[idx].message.channel : message.channel;

      if (responses[idx].type === 'custom') {
        let opts = responses[idx].message;

        opts.bot_id = this.selfId;
        opts.type = 'message';
        opts.subtype = 'bot_message';
        opts.as_user = false;

        this.web.chat.postMessage(channel, responses[idx].message.text, opts);
        break;
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

module.exports = Message;