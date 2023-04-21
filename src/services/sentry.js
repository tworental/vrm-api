const config = require('config')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const Integrations = require('@sentry/integrations')

exports.init = (app) => {
  let integrations = [
    new Integrations.ExtraErrorData({ depth: 10 }),
  ]

  if (app) {
    integrations = [
      ...integrations,
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ]
  }

  Sentry.init({
    dsn: config.get('sentryDsn'),
    environment: config.get('environment'),
    release: config.get('releaseId'),
    tracesSampleRate: 1.0,
    integrations,
    normalizeDepth: 11,
  })
}

exports.requestHandler = () => Sentry.Handlers.requestHandler()

exports.tracingHandler = () => Sentry.Handlers.tracingHandler()

exports.errorHandler = () => Sentry.Handlers.errorHandler({
  shouldHandleError: (error) => config.get('errorHandler.reporting') && !error.expose,
})

exports.captureException = (error) => Promise.resolve(exports.init())
  .then(() => Sentry.captureException(error))
