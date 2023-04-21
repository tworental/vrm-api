const { subscribe } = require('../services/sqs')
const { logError } = require('../services/logger')
const { captureException } = require('../services/sentry')

jest.mock('../services/sqs')
jest.mock('../services/logger')
jest.mock('../services/sentry')

const service = require('./queueSubscriber')

describe('queueSubscriber worker', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize process events and subscribe methods', async () => {
    const error = { message: 'message', stack: 'stack' }
    const processSpy = jest.spyOn(process, 'on')
      .mockImplementation((_, fn) => fn(error))

    const subscribeFn = jest.fn()
    subscribe.mockResolvedValue(subscribeFn)

    await service()

    expect(processSpy).toBeCalledWith('unhandledRejection', expect.any(Function))
    expect(processSpy).toBeCalledWith('uncaughtException', expect.any(Function))
    expect(captureException).toBeCalledWith(error)
    expect(logError).toBeCalledWith('unhandled-rejection-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
    expect(logError).toBeCalledWith('uncaught-exception-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
    expect(subscribe).toBeCalledWith(expect.any(String))
    expect(subscribeFn).toBeCalledWith(expect.any(Function))
  })
})
