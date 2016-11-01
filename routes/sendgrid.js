require('dotenv').config()
var helper = require('sendgrid').mail
var from_email = new helper.Email('test@example.com')
var to_email = new helper.Email('test@example.com')
var subject = 'Hello World from the SendGrid Node.js Library!'
var content = new helper.Content('text/plain', 'Hello, Email!')
var mail = new helper.Mail(from_email, subject, to_email, content)

var sg = require('sendgrid')(process.env.process.env.SENDGRID__API_ID)
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
})

sg.API(request, function(error, response) {
  console.log(response.statusCode)
  console.log(response.body)
  console.log(response.headers)
})
