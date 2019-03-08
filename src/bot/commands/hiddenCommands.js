messageHasHiddenCommand = (message) => {

    if (!message) return null;

    if (message.toLowerCase().includes('screwdriver') || message.toLowerCase().includes('screw driver')) {
        return 'denzel';
    }

    return null;
};

module.exports = {
    messageHasHiddenCommand,
    hiddenReplies: require('./hiddenReplies')
}