const { logError } = require('../../../services/logger')
const { sendSms } = require('../../../services/vonage')

jest.mock('../../../services/logger')
jest.mock('../../../services/vonage')

const topic = require('./sendSms')

describe('reminders/sendSms topic', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should log error during sending sms', async () => {
    const event = {
      reminderPhoneNumber: 'reminderPhoneNumber',
      reminderEventType: 'beforeService',
    }
    const error = { message: 'message', stack: 'stack' }

    sendSms.mockRejectedValueOnce(error)

    await expect(topic.handler(event))
      .resolves.toBeUndefined()

    expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'beforeService')
    expect(logError).toBeCalledWith('unhandled-rejection-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
  })

  describe('event types', () => {
    it('should not send sms for not existed type', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'notExistedEventType',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).not.toBeCalled()
    })

    it('should send sms for beforeService', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'beforeService',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'beforeService')
    })

    it('should send sms for afterService', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'afterService',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'afterService')
    })

    it('should send sms for beforeCheckIn', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'beforeCheckIn',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'beforeCheckIn')
    })

    it('should send sms for afterCheckIn', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'afterCheckIn',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'afterCheckIn')
    })

    it('should send sms for beforeCheckOut', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'beforeCheckOut',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'beforeCheckOut')
    })

    it('should send sms for afterCheckOut', async () => {
      const event = {
        reminderPhoneNumber: 'reminderPhoneNumber',
        reminderEventType: 'afterCheckOut',
      }

      await expect(topic.handler(event))
        .resolves.toBeUndefined()

      expect(sendSms).toBeCalledWith(event.reminderPhoneNumber, 'afterCheckOut')
    })
  })
})
