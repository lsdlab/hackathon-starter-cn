require('dotenv').config()
const Q = require('q')
const nunjucks = require('nunjucks')
const postmark = require('postmark')
const client = new postmark.Client(process.env.POSTMARK_API_ID)
const emailTpl = require('./email-template')


function sendWelcomeEmail(target_email, name, username, action_url) {
  var sendWelcomeDefer = Q.defer()

  var tplString = emailTpl.welcome
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    name: name,
    action_url: action_url,
    login_url: process.env.login_url,
    username: username,
    support_email: process.env.support_email,
    live_chat_url: process.env.live_chat_url,
    sender_name: process.env.sender_name,
    about_url: process.env.about_url,
    company_name: process.env.company_name
  })

  var subject = 'Welcome to ' + process.env.product_name + ', ' + name + '!'
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendWelcomeDefer.reject(error.message)
    }
    sendWelcomeDefer.resolve('')
  })

  return sendWelcomeDefer.promise
}


function sendResetPasswordEmail(target_email, name, action_url, operating_system, browser_name) {
  var sendForgotPasswordDefer = Q.defer()

  var tplString = emailTpl.resetPassword
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    name: name,
    action_url: action_url,
    operating_system: operating_system,
    browser_name: browser_name,
    support_email: process.env.support_email,
    company_name: process.env.company_name
  })

  var subject = 'Set up a new password for ' + process.env.product_name
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendForgotPasswordDefer.reject(error.message)
    }
    sendForgotPasswordDefer.resolve('')
  })

  return sendForgotPasswordDefer.promise
}


function sendNotifyModifyPasswordEmail(target_email, name, action_url, operating_system, browser_name) {
  var sendNotifyModifyPasswordDefer = Q.defer()

  var tplString = emailTpl.resetPassword
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    name: name,
    action_url: action_url,
    operating_system: operating_system,
    browser_name: browser_name,
    support_email: process.env.support_email,
    company_name: process.env.company_name
  })

  var subject = 'Modified ' + process.env.product_name + ' account password'
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendNotifyModifyPasswordDefer.reject(error.message)
    }
    sendNotifyModifyPasswordDefer.resolve('')
  })

  return sendNotifyModifyPasswordDefer.promise
}


function sendNotifyUnlinkPorviderEmail(target_email, provider, name, action_url, operating_system, browser_name) {
  var sendNotifyUnlinkPorviderDefer = Q.defer()

  var tplString = emailTpl.resetPassword
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    provider: provider,
    name: name,
    action_url: action_url,
    operating_system: operating_system,
    browser_name: browser_name,
    support_email: process.env.support_email,
    company_name: process.env.company_name
  })

  var subject = 'Unlink ' + provider + ' with ' + process.env.product_name
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendNotifyUnlinkPorviderDefer.reject(error.message)
    }
    sendNotifyUnlinkPorviderDefer.resolve('')
  })

  return sendNotifyUnlinkPorviderDefer.promise
}


function sendNotifyDeleteAccountEmail(target_email, name, action_url, operating_system, browser_name) {
  var sendNotifyDeleteAccountDefer = Q.defer()

  var tplString = emailTpl.resetPassword
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    name: name,
    action_url: action_url,
    operating_system: operating_system,
    browser_name: browser_name,
    support_email: process.env.support_email,
    live_chat_url: process.env.live_chat_url,
    company_name: process.env.company_name
  })

  var subject = 'Delete ' + process.env.product_name + ' account'
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendNotifyDeleteAccountDefer.reject(error.message)
    }
    sendNotifyDeleteAccountDefer.resolve('')
  })

  return sendNotifyDeleteAccountDefer.promise
}


function sendNotifySetupApiEmail(target_email, name, action_url, api_key, api_secret, operating_system, browser_name) {
  var sendNotifySetupApiDefer = Q.defer()

  var tplString = emailTpl.resetPassword
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    name: name,
    action_url: action_url,
    api_key: api_key,
    api_secret: api_secret,
    support_email: process.env.support_email,
    live_chat_url: process.env.live_chat_url,
    operating_system: operating_system,
    browser_name: browser_name,
    company_name: process.env.company_name
  })

  var subject = 'Setup' + process.env.product_name + ' API'
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendNotifySetupApiDefer.reject(error.message)
    }
    sendNotifySetupApiDefer.resolve('')
  })

  return sendNotifySetupApiDefer.promise
}


function sendUserInvitationEmail(target_email, invite_sender_name, invite_sender_organization_name, name, action_url) {
  var sendUserInvitationDefer = Q.defer()

  var tplString = emailTpl.resetPassword
  var renderedTpl = nunjucks.renderString(tplString, {
    product_name: process.env.product_name,
    product_url: process.env.product_url,
    invite_sender_name: invite_sender_name,
    invite_sender_organization_name: invite_sender_organization_name,
    name: name,
    action_url: action_url,
    support_email: process.env.support_email,
    live_chat_url: process.env.live_chat_url,
    about_url: process.env.about_url,
    company_name: process.env.company_name
  })

  var subject = invite_sender_name + ' invited you to ' + process.env.product_name
  client.sendEmail({
    'From': process.env.from,
    'To': target_email,
    'Subject': subject,
    'HtmlBody': renderedTpl
  }, function(error) {
    if (error) {
      sendUserInvitationDefer.reject(error.message)
    }
    sendUserInvitationDefer.resolve('')
  })

  return sendUserInvitationDefer.promise
}


module.exports.sendWelcomeEmail = sendWelcomeEmail
module.exports.sendResetPasswordEmail = sendResetPasswordEmail
module.exports.sendNotifyModifyPasswordEmail = sendNotifyModifyPasswordEmail
module.exports.sendNotifyUnlinkPorviderEmail = sendNotifyUnlinkPorviderEmail
module.exports.sendNotifyDeleteAccountEmail = sendNotifyDeleteAccountEmail
module.exports.sendNotifySetupApiEmail = sendNotifySetupApiEmail
module.exports.sendNotifySetupApiEmail = sendUserInvitationEmail
