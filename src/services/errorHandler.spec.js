const config = require('config')

const { captureException } = require('./sentry')
const { logError } = require('./logger')

jest.mock('config')
jest.mock('./sentry')
jest.mock('./logger')

const { withHttpErrorHandling, withErrorReporting } = require('./errorHandler')

describe('errorHandler service', () => {
  afterEach(jest.clearAllMocks)

  describe('withHttpErrorHandling', () => {
    const req = {
      originalUrl: 'originalUrl',
      body: 'body',
      params: 'params',
      headers: 'headers',
    }

    const res = 'res'
    const next = 'next'

    it('should run error handler with stack trace', () => {
      const error = {
        name: 'Error',
        message: 'Internal Error',
        errors: [],
        stack: 'line1\nline2',
      }

      const handler = jest.fn().mockImplementation()

      expect(withHttpErrorHandling(handler)(error, req, res, next)).toBeUndefined()

      expect(config.get).toBeCalledWith('errorHandler.trace')

      expect(logError).toBeCalledWith('error-handler', {
        statusCode: 500,
        name: 'Error',
        errorMessage: 'Internal Error',
        errors: [],
        stackTrace: ['line1', 'line2'],
        request: req,
      })

      expect(handler).toBeCalledWith({
        statusCode: 500,
        error: {
          name: 'Error',
          message: 'Internal Error',
          errors: [],
          stackTrace: ['line1', 'line2'],
        },
      }, req, res, next)
    })

    it('should run error handler without stack trace', () => {
      const error = {
        statusCode: 400,
        name: 'Error',
        message: 'Validation Error',
        stack: 'line1\nline2',
      }

      const handler = jest.fn().mockImplementation()

      expect(withHttpErrorHandling(handler)(error, req, res, next)).toBeUndefined()

      expect(config.get).toBeCalledWith('errorHandler.trace')
      expect(logError).toBeCalledWith('error-handler', {
        statusCode: 400,
        name: 'Error',
        errorMessage: 'Validation Error',
        request: req,
      })
      expect(handler).toBeCalledWith({
        statusCode: 400,
        error: {
          name: 'Error',
          message: 'Validation Error',
        },
      }, req, res, next)
    })
  })

  describe('withErrorReporting', () => {
    const args = { key: 'value' }

    const error = new Error('Internal Error')
    const handler = jest.fn().mockImplementation(() => { throw error })

    it('should run error handler with stack trace', async () => {
      await expect(withErrorReporting(handler)(args)).resolves.toBeUndefined()

      expect(config.get).toBeCalledWith('errorHandler.trace')
      expect(handler).toBeCalledWith(args)
      expect(logError).toBeCalledWith('error-handler', {
        statusCode: 500,
        name: 'Error',
        errorMessage: 'Internal Error',
        stackTrace: expect.any(Array),
      })
      expect(captureException).toBeCalledWith(error)
    })

    it('should run error handler without stack trace', async () => {
      config.get.mockImplementation(() => false)

      await expect(withErrorReporting(handler)(args)).resolves.toBeUndefined()

      expect(config.get).toBeCalledWith('errorHandler.trace')
      expect(handler).toBeCalledWith(args)
      expect(logError).toBeCalledWith('error-handler', {
        statusCode: 500,
        name: 'Error',
        errorMessage: 'Internal Error',
      })
      expect(captureException).toBeCalledWith(error)
    })
  })
})
