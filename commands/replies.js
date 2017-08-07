var version = require('../version.js');

var exports = module.exports = {};

exports.commandBerto = function commandBerto(message, commandMsg) {
  return '<@U2ASHP5FT> ayo berto :100:';
}

exports.commandGoHawks = function commandGoHawks(message, commandMsg) {
  return '#gohawks';
}

exports.commandRussell = function commandRussell(message, commandMsg) {
  return '`beep boop i am russell_bot`';
}

exports.commandLit = function commandLit(message, commandMsg) {
  return ':100::100::100::fire::fire::fire::champagne::champagne::champagne:';
}

exports.commandExBert = function commandExbert(message, commandMsg) {
  // lol
  return `<@U2ASHP5FT>, <@${message.user}> needs an exbert: ${commandMsg}`;
}

exports.commandTrapHorns = function commandTrapHorns(message, commandMsg) {
  return 'https://www.youtube.com/watch?v=Ip1SYl97kh4 :trumpet::trumpet::trumpet::trumpet:';
}

exports.commandEscalate = function commandEscalate(message, commandMsg) {
  if (message.user !== "U2ARFPF62") {
    return 'Thanks for your ticket, an associate will be with you shortly.';
  }

  return `<@U2ASHP5FT> :fire::fire: [HIGH PRIORITY] :fire::fire: ${commandMsg} :fire::fire: [HIGH PRIORITY] :fire::fire:`;
}

exports.commandBlessUp = function commandBlessUp(message, commandMsg) {
 return 'bless up :djkhaled::key:';
}

exports.commandVersion = function showVersion(message, commandMsg) {
  return `russell_bot version: \`${version.version}\``;
}