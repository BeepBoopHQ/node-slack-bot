var Botkit = require('botkit')

// Expect a SLACK_TOKEN environment variable
var slackToken = process.env.SLACK_TOKEN
if (!slackToken) {
  console.error('SLACK_TOKEN is required!')
  process.exit(1)
}

var controller = Botkit.slackbot()
var bot = controller.spawn({
  token: slackToken
})

bot.startRTM(function (err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

var test = 'just testing'
var albumArray = ['LCD Soundsystem - Sound of Silver', 'Tom Petty - Wildflowers', 'The Head and the Heart - The Head and the Heart','Sufjan Stevens - Illinois','Cake - Prolonging the Magic','The Format Dog Problems','The Avett Brothers - Second Gleam','Death Cab for Cutie - Transatlantism','Red Hot Chili Peppers - By the Way','The Violet Archers - End of Part One']
var randomAlbum

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['album'], ['direct_mention'], function (bot, message) {
  randomAlbum = albumArray[Math.floor(Math.random() * albumArray.length)]
  bot.reply(message, randomAlbum)
})

controller.hears(['rocky'], ['direct_message','direct_mention','mention','ambient'], function (bot, message) {
  bot.reply(message, 'Honestly slackbot, I think you\'re being a bit harsh on the guy.')
})

controller.hears(['frank'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'FRANK!')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
