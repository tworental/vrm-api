// const config = require('config')
// const morgan = require('morgan')
// const express = require('express')
// const fileUpload = require('express-fileupload')
// const bodyParser = require('body-parser')
// const cookieParser = require('cookie-parser')
// const requestIp = require('request-ip')
// const helmet = require('helmet')
// const cors = require('cors')

// const sentry = require('./services/sentry')
// const { logStream } = require('./services/logger')
// const { withHttpErrorHandling } = require('./services/errorHandler')

// jest.mock('config')
// jest.mock('@sentry/node')
// jest.mock('@sentry/integrations')
// jest.mock('morgan')
// jest.mock('express')
// jest.mock('express-fileupload')
// jest.mock('body-parser')
// jest.mock('cookie-parser')
// jest.mock('request-ip')
// jest.mock('helmet')
// jest.mock('cors')
// jest.mock('./services/sentry')
// jest.mock('./services/errors')
// jest.mock('./services/logger')
// jest.mock('./services/errorHandler')
// jest.mock('./handlers/api')
// jest.mock('./handlers/webhooks')

// jest.mock('express', () => ({
//   Router: () => ({ }),
// }))

// const app = require('./app')

// describe('app bootstrap', () => {
//   afterEach(jest.clearAllMocks)

//   it('should create an app', () => {
//     app()

//     expect(express).toBeCalled()
//     expect(helmet).toBeCalled()
//     expect(cors).toBeCalled()
//     expect(fileUpload).toBeCalled()
//     expect(morgan).toBeCalledWith('combined', { stream: logStream })
//     expect(bodyParser.urlencoded).toBeCalledWith({ extended: true })
//     expect(bodyParser.json).toBeCalledWith({ verify: expect.any(Function) })
//     expect(cookieParser).toBeCalledWith('cookiesecret')
//     expect(requestIp.mw).toBeCalled()
//     expect(sentry.init).toBeCalled()
//     expect(sentry.errorHandler).toBeCalled()
//     expect(withHttpErrorHandling).toBeCalledWith(expect.any(Function))

//     expect(config.get).toHaveBeenNthCalledWith(1, 'server.locationPrefix')
//   })
// })
