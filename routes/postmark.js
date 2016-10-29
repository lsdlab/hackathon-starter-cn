const dotenv = require('dotenv')
dotenv.load({
  path: '.env.development'
})

const Q = require('q')
const postmark = require('postmark')
const client = new postmark.Client(process.env.POSTMARK_API_ID)

function sendConfirmEmail(target_email, name, username, action_url) {
  var sendConfirmEmailDefer = Q.getDeefer()

  client.sendEmailWithTemplate({
    'From': 'lab@breakwire.me',
    'TemplateId': 1037544,
    'To': target_email,
    'TemplateModel': {
      'product_name': 'Hackathon Starter CN',
      'name': name,
      'action_url': action_url,
      'username': username,
      'sender_name': 'BreakWire Lab',
      'product_address_line1': 'For love and peace'
    }
  }, function(error) {
    if (error) {
      sendConfirmEmailDefer.reject(error.message)
    }
    sendConfirmEmailDefer.resolve('')
  })

  return sendConfirmEmailDefer.promise
}


module.exports.sendConfirmEmail = sendConfirmEmail
