const config = require('config')

const { CODES, MESSAGES } = require('./errorCodes')
const { captureException } = require('./sentry')
const { logError } = require('./logger')

exports.withErrorReporting = (handler) => async (...args) => {
  try {
    await handler(...args)
  } catch (error) {
    const {
      statusCode: errorCode, name, message, errors, stack,
    } = error

    const statusCode = errorCode || 500

    const stackTrace = config.get('errorHandler.trace') && statusCode === 500
      ? stack.split('\n')
      : undefined

    logError('error-handler', {
      errorMessage: message,
      statusCode,
      name,
      errors,
      stackTrace,
    })

    await captureException(error)
  }
}

exports.withHttpErrorHandling = (handler) => (err, req, res, next) => {
  const {
    statusCode: errorCode, name, code, message, errors, stack,
  } = err

  const {
    originalUrl, body, params, headers,
  } = req

  const statusCode = errorCode || 500

  const stackTrace = config.get('errorHandler.trace') && statusCode === 500
    ? stack.split('\n')
    : undefined

  logError('error-handler', {
    errorMessage: message,
    statusCode,
    name,
    errors,
    stackTrace,
    request: {
      originalUrl,
      body,
      params,
      headers,
    },
  })

  let error = {
    name,
    code,
    message,
    errors,
    stackTrace,
  }

  /**
   * For production we don't want to expose critical informations like SQL errors.
   */
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    error = {
      name,
      code: CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.INTERNAL_SERVER_ERROR,
    }
  }

  handler({ statusCode, error }, req, res, next)
}
