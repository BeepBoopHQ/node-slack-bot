const dbUtils = require('../util/db/dbUtils');

module.exports.getCommandStats = (message, args, messageHandler) => {
    return dbUtils.getCommandStats(message, messageHandler);
}