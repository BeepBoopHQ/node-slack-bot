var exports = module.exports = {};

var testArray = [];

exports.addToArray = function(message, args) {
    testArray.push(args);
    return "added " + args;
}

exports.theArray = function(message, args) {
    console.log(testArray);
    return "state len " + testArray.length;
}