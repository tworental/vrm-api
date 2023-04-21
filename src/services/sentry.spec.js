const config = require('config')
const Sentry = require('@sentry/node')
const Integrations = require('@sentry/integrations')

jest.mock('@sentry/node')
jest.mock('@sentry/integrations')

const sentryService = require('./sentry')

describe('sentry service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should initialize the Sentry plugin', () => {
    expect(sentryService.init()).toBeUndefined()

    expect(Sentry.init).toBeCalledWith({
      dsn: 'sentryDsn',
      environment: 'environment',
      release: 'releaseId',
      integrations: [expect.any(Object)],
      normalizeDepth: 11,
      tracesSampleRate: 1,
    })

    expect(Integrations.ExtraErrorData).toBeCalledWith({ depth: 10 })
  })

  it('should capture an exception', async () => {
    const error = 'errors'

    const init = jest.spyOn(sentryService, 'init').mockImplementation(() => true)

    await expect(sentryService.captureException(error)).resolves.toBeUndefined()

    expect(init).toBeCalled()
    expect(Sentry.captureException).toBeCalledWith(error)
  })

  describe('errorHandler', () => {
    it('should handle an error', () => {
      Sentry.Handlers.errorHandler.mockImplementation((args) => args)

      expect(sentryService.errorHandler().shouldHandleError({ expose: true })).toBeFalsy()
      expect(config.get).toHaveBeenNthCalledWith(1, 'errorHandler.reporting')
    })

    it('should returns an express errorHandler', () => {
      const results = 'data'

      Sentry.Handlers.errorHandler.mockReturnValue('data')

      expect(sentryService.errorHandler()).toBe(results)
      expect(Sentry.Handlers.errorHandler).toBeCalledWith({
        shouldHandleError: expect.any(Function),
      })
    })
  })
})
