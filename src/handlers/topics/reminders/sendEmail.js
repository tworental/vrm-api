const config = require('config')

const { logError } = require('../../../services/logger')
const { sendMail } = require('../../../services/mailing')
const { EMAIL_TEMPLATES } = require('../../../models/v1/users/constants')
const { EVENT_TYPES } = require('../../../models/v1/service-reminders/constants')

exports.queueName = config.get('aws.sqs.reminderEmailsQueue')

exports.handler = async (event) => {
  const { reminderEmail: email } = event
  const lang = 'en' // TODO: replace with real lang
  let type
  let params

  switch (event.reminderEventType) {
    case EVENT_TYPES.BEFORE_SERVICE: {
      type = EMAIL_TEMPLATES.REMINDERS_BEFORE_SERVICE
      params = {}
      break
    }
    case EVENT_TYPES.AFTER_SERVICE: {
      type = EMAIL_TEMPLATES.REMINDERS_AFTER_SERVICE
      params = {}
      break
    }
    case EVENT_TYPES.BEFORE_CHECK_IN: {
      type = EMAIL_TEMPLATES.REMINDERS_BEFORE_CHECKIN
      params = {}
      break
    }
    case EVENT_TYPES.AFTER_CHECK_IN: {
      type = EMAIL_TEMPLATES.REMINDERS_AFTER_CHECKIN
      params = {}
      break
    }
    case EVENT_TYPES.BEFORE_CHECK_OUT: {
      type = EMAIL_TEMPLATES.REMINDERS_BEFORE_CHECKOUT
      params = {}
      break
    }
    case EVENT_TYPES.AFTER_CHECK_OUT: {
      type = EMAIL_TEMPLATES.REMINDERS_AFTER_CHECKOUT
      params = {}
      break
    }
    default:
      return
  }

  try {
    await sendMail(type, lang, email, params)
  } catch (error) {
    logError('unhandled-rejection-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
  }
}
