const config = require('config')
const morgan = require('morgan')
const express = require('express')
const fileUpload = require('express-fileupload')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const requestIp = require('request-ip')
const helmet = require('helmet')
const cors = require('cors')

const sentry = require('./services/sentry')
const createError = require('./services/errors')
const { logStream } = require('./services/logger')
const { withHttpErrorHandling } = require('./services/errorHandler')

const handlersApi = require('./handlers/api')
const handlersWebhooks = require('./handlers/webhooks')

const ONE_MINUTE_NUMBER = 60 * 1000

module.exports = () => {
  const app = express()

  sentry.init(app)

  // NOTE: Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  //   see https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', 1)

  app.use(sentry.requestHandler())
  app.use(sentry.tracingHandler())
  app.use(morgan('combined', { stream: logStream }))
  app.use(helmet({
    frameguard: false,
    contentSecurityPolicy: false,
  }))
  app.use(cors({ origin: '*' }))
  app.use(cookieParser('cookiesecret'))
  app.use(fileUpload({
    limits: { fileSize: 50000000 },
  }))
  app.use(rateLimit({
    windowMs: ONE_MINUTE_NUMBER * 5, // 5 minutes
    max: 10000,
  }))
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json({
    // NOTE: We need the raw body to verify webhook signatures.
    //   Let's compute it only when hitting the Stripe webhook endpoint.
    verify: (req, res, buffer) => {
      if (req.originalUrl.startsWith('/webhooks/stripe')) {
        req.rawBody = buffer.toString()
      }
    },
  }))
  app.use(requestIp.mw())

  app.use(config.get('server.locationPrefix'), handlersApi)
  app.use('/webhooks', handlersWebhooks)

  app.use((req, res, next) => next(createError(404)))
  app.use(sentry.errorHandler())
  app.use(withHttpErrorHandling(({ statusCode, error }, req, res) => {
    res.status(statusCode)
    res.json({ error })
  }))

  return app
}
