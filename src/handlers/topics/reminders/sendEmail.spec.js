const { logError } = require('../../../services/logger')
const { sendMail } = require('../../../services/mailing')

jest.mock('../../../services/logger')
jest.mock('../../../services/mailing')

const topic = require('./sendEmail')

describe('reminders/sendEmail topic', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should log error during sending mail', async () => {
    const event = {
      reminderEmail: 'reminderEmail',
      reminderEventType: 'beforeService',
    }
    const error = { message: 'message', stack: 'stack' }

    sendMail.mockRejectedValueOnce(error)

    await expect(topic.handler(event))
      .resolves.toBeUndefined()

    expect(sendMail).toBeCalledWith('reminders-before-service', 'en', event.reminderEmail, {})
    expect(logError).toBeCalledWith('unhandled-rejection-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
  })

  describe('event types', () => {
    it('should not send mail for not existed type', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'notExistedType',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).not.toBeCalled()
    })

    it('should send mail for beforeService', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'beforeService',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).toBeCalledWith('reminders-before-service', 'en', event.reminderEmail, {})
    })

    it('should send mail for afterService', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'afterService',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).toBeCalledWith('reminders-after-service', 'en', event.reminderEmail, {})
    })

    it('should send mail for beforeCheckIn', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'beforeCheckIn',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).toBeCalledWith('reminders-before-checkin', 'en', event.reminderEmail, {})
    })

    it('should send mail for afterCheckIn', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'afterCheckIn',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).toBeCalledWith('reminders-after-checkin', 'en', event.reminderEmail, {})
    })

    it('should send mail for beforeCheckOut', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'beforeCheckOut',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).toBeCalledWith('reminders-before-checkout', 'en', event.reminderEmail, {})
    })

    it('should send mail for afterCheckOut', async () => {
      const event = {
        reminderEmail: 'reminderEmail',
        reminderEventType: 'afterCheckOut',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendMail).toBeCalledWith('reminders-after-checkout', 'en', event.reminderEmail, {})
    })
  })
})
