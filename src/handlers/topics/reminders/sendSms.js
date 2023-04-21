const config = require('config')

const { logError } = require('../../../services/logger')
const { sendSms } = require('../../../services/vonage')
const { EVENT_TYPES } = require('../../../models/v1/service-reminders/constants')

exports.queueName = config.get('aws.sqs.reminderSmsQueue')

exports.handler = async (event) => {
  const { reminderPhoneNumber: phoneNumber } = event
  let content

  switch (event.reminderEventType) {
    case EVENT_TYPES.BEFORE_SERVICE: {
      content = EVENT_TYPES.BEFORE_SERVICE
      break
    }
    case EVENT_TYPES.AFTER_SERVICE: {
      content = EVENT_TYPES.AFTER_SERVICE
      break
    }
    case EVENT_TYPES.BEFORE_CHECK_IN: {
      content = EVENT_TYPES.BEFORE_CHECK_IN
      break
    }
    case EVENT_TYPES.AFTER_CHECK_IN: {
      content = EVENT_TYPES.AFTER_CHECK_IN
      break
    }
    case EVENT_TYPES.BEFORE_CHECK_OUT: {
      content = EVENT_TYPES.BEFORE_CHECK_OUT
      break
    }
    case EVENT_TYPES.AFTER_CHECK_OUT: {
      content = EVENT_TYPES.AFTER_CHECK_OUT
      break
    }
    default:
      return
  }

  try {
    await sendSms(phoneNumber, content)
  } catch (error) {
    logError('unhandled-rejection-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
  }
}
