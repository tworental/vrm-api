const winston = jest.genMockFromModule('winston')

winston.createLogger = jest.fn().mockReturnValue(winston)

winston.transports = {
  Console: jest.fn(),
}

const format = jest.fn().mockReturnValue(jest.fn())
format.json = jest.fn()
format.combine = jest.fn()
format.colorize = jest.fn()
format.timestamp = jest.fn()
format.prettyPrint = jest.fn()

winston.format = format

module.exports = winston
