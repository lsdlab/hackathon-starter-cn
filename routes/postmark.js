require('dotenv').config()

const Q = require('q')
const nunjucks = require('nunjucks')
const postmark = require('postmark')
const client = new postmark.Client(process.env.POSTMARK_API_ID)
const emailTpl = require('./email-template')

function sendWelcomeEmail(target_email, name, username, action_url) {
  var sendWelcomeEmailDefer = Q.defer()

  var welcomeTplString = emailTpl.welcome
  var welcomeTpl = nunjucks.renderString(welcomeTplString, {
    from: process.env.from,
    product_name: process.env.product_name,
    name: name,
    action_url: action_url,
    login_url: process.env.login_url,
    username: 'username',
    support_email: process.env.support_email,
    live_chat_url: process.env.live_chat_url,
    sender_name: process.env.sender_name,
    about_url: process.env.about_url,
    company_name: process.env.company_name
  })

  client.sendEmail({
    'From': 'lab@breakwire.me',
    'To': target_email,
    'HtmlBody': welcomeTpl
  }, function(error) {
    if (error) {
      sendWelcomeEmailDefer.reject(error.message)
    }
    sendWelcomeEmailDefer.resolve('')
  })

  return sendWelcomeEmailDefer.promise
}

function sendForgotPasswordEmail() {

}


module.exports.sendWelcomeEmail = sendWelcomeEmail
module.exports.sendForgotPasswordEmail = sendForgotPasswordEmail
