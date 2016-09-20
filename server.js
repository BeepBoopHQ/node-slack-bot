'use strict'
const express = require('express')
const Slapp = require('slapp')
const BeepBoopConvoStore = require('slapp-convo-beepboop')
const BeepBoopContext = require('slapp-context-beepboop')

// use whatever port you want...(example: if you are redirecting back for development through ngrok listening on port 3000)
var port = process.env.PORT || 3000
var version = '1.0'
var slapp = Slapp({
  record: 'out.jsonl',
  convo_store: BeepBoopConvoStore(),
  context: BeepBoopContext()
})

// attach Slapp to Express....
var app = slapp.attachToExpress(express())

// Beginning handling user messages section...

// response to the user typing "help"
slapp.message('help', ['mention', 'direct_message'], (msg) => {
  var help = 'I will respond to the following messages: \n' +
      '`help` - to see this message. \n' +
      '`hi` - to demonstrate a multiple prompt/response message.\n' +
      '`thanks` - to demonstrate a simple response.\n' +
      '`you are awesome` - to demonstrate responding with an emoticon smile.\n' +
      '`<type-any-other-text>` - to demonstrate a random emoticon response.\n' +            
      '`attachment` - to see a Slack attachment message.\n'
  msg.say(help)
})

// This first section is an example of a multi-response conversation...we first ask the user "how they are"
var handleHowAreYou = 'handleHowAreYou'
slapp.message('^(hi|hello|hey)$', ['direct_mention', 'direct_message'], (msg, text) => {
  msg
    .say(text + ', how are you?')
    .route(handleHowAreYou, {}, 60) // note here, the next defined handler (e.g. handleHowAreYou()) will be called next.
})

// here we are getting called...we respond "good" no-matter what they say, and then wat for them to reepond yet again. 
slapp.route(handleHowAreYou, (msg) => {
  var resp = msg.body.event && msg.body.event.text

  if (new RegExp('good', 'i').test(resp)) {
    msg
      .say(['Great! Ready?', ':smile: Are you sure?'])
      .route(handleHowAreYou, 60)  // notice here...the request is to come through this handler their very NEXT response...
  } else {
    msg.say('Me too')
  }
})

// standard response to the user typing "Thank you"
slapp.message('^(thanks|thank you)', ['mention', 'direct_message'], (msg) => {
  msg.say(['You are welcome'])
})

// standard response to the user typing "good night"
slapp.message('good night|bye', ['mention', 'direct_message'], (msg) => {
  msg.say(['Cheers :beers:', 'Bye', 'Goodbye', 'Adios'])
})

// response to the user typing "good night"
slapp.message('you are awesome', ['mention', 'direct_message'], (msg) => {
  msg.say([':smile:'])
})

// demonstrate returning an attachment...
slapp.message('attachment', ['mention', 'direct_message'], (msg) => {
  msg.say({
    text: ' ',
      attachments: [
        {
          text: 'Slapp is a robust open source library that sits on top of the Slack APIs',
          fallback: '',
	  title: 'Slapp Library - Open Source',
          image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
          title_link: 'https://beepboophq.com/',
          color: '#7CD197'	  
        }]
  })
})

// response to any GENERAL message (not handled above)...so you have to put your messages in ORDER from top-down...this is catch all!
slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  // respond only 40% of the time
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})
// End of Handling user messages section...

// have express listen on defined port...
app.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('Listening on :' + port)
  console.log('Slapp Sample Bot. Ver ' + version)
})

