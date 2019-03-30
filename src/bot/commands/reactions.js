module.exports.commandSupreme = (message, commandMsg) => {
    let messageTs = message.thread_ts || message.ts;

    return [{
        type: 'reaction',
        reaction: 'supreme-s',
        timestamp: messageTs
    }, {
        type: 'reaction',
        reaction: 'supreme-u',
        timestamp: messageTs
    },{
        type: 'reaction',
        reaction: 'supreme-p',
        timestamp: messageTs
    },{
        type: 'reaction',
        reaction: 'supreme-r',
        timestamp: messageTs
    },{
        type: 'reaction',
        reaction: 'supreme-e1',
        timestamp: messageTs
    },{
        type: 'reaction',
        reaction: 'supreme-m',
        timestamp: messageTs
    },{
        type: 'reaction',
        reaction: 'supreme-e2',
        timestamp: messageTs
    },]
};