messageHasHiddenCommand = (message) => {

    if (message.includes('screwdriver') || message.includes('screw driver')) {
        return 'denzel';
    }

    return null;
};

module.exports = {
    messageHasHiddenCommand,
    hiddenReplies: require('./hiddenReplies')
}