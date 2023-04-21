const { subscribe } = require('../services/sqs')
const { logError } = require('../services/logger')
const { captureException } = require('../services/sentry')
const topics = require('../handlers/topics')

module.exports = async () => {
  process.on('unhandledRejection', (error) => {
    captureException(error)
    logError('unhandled-rejection-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
  })

  process.on('uncaughtException', (error) => {
    captureException(error)
    logError('uncaught-exception-occured', {
      errorMessage: error.message,
      stack: error.stack,
      ...error,
    })
  })

  await Promise.all(topics.map(async ({ queueName, handler }) => (await subscribe(queueName))(handler)))
}
