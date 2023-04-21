const sendEmailHandler = require('./sendEmail')
const sendSmsHandler = require('./sendSms')

module.exports = [
  sendEmailHandler,
  sendSmsHandler,
]
