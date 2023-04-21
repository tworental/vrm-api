const {
  createLogger,
  transports: { Console },
  format,
} = require('winston')
const config = require('config')

jest.mock('winston')
jest.mock('config')

const loggerService = require('./logger')

describe('logger service', () => {
  afterEach(jest.clearAllMocks)

  it('should create an instance', () => {
    const logger = {
      add: jest.fn(),
      data: 'logger',
    }
    createLogger.mockReturnValue(logger)

    const formatCombineResult = 'formatCombineResult'
    format.combine.mockReturnValue(formatCombineResult)
    const formatPrettyPrintResult = 'formatPrettyPrintResult'
    format.prettyPrint.mockReturnValue(formatPrettyPrintResult)
    const formatJsonesult = 'formatJsonesult'
    format.json.mockReturnValue(formatJsonesult)

    expect(loggerService.getInstance(true)).toBe(logger)

    expect(createLogger).toBeCalledWith({
      exitOnError: false,
      level: 'logger.level',
      format: formatCombineResult,
    })

    expect(format.combine).toBeCalledWith(
      formatJsonesult,
    )

    expect(config.get).toHaveBeenNthCalledWith(1, 'logger.level')
    expect(config.get).toHaveBeenNthCalledWith(2, 'logger.formats')
    expect(Console).toBeCalled()
  })

  it('should get the same instance on the next call', async () => {
    const logger = {
      add: jest.fn(),
      data: 'logger',
    }
    createLogger.mockReturnValue(logger)

    expect(loggerService.getInstance(true)).toBe(logger)
    expect(loggerService.getInstance()).toBe(logger)

    expect(createLogger).toBeCalledTimes(1)
  })

  it('should write to stream with the info level', () => {
    const info = jest.fn()
    jest.spyOn(loggerService, 'getInstance').mockReturnValue({
      info,
    })

    loggerService.logStream.write('message\n')

    expect(info).toBeCalledWith('message')
  })

  it('should log with the debug level', () => {
    const debug = jest.fn()
    const getInstance = jest.spyOn(loggerService, 'getInstance').mockReturnValue({
      debug,
    })

    const message = 'message'
    loggerService.logDebug(message)

    expect(getInstance).toBeCalled()
    expect(debug).toBeCalledWith(message)
  })

  it('should log with the info level', () => {
    const info = jest.fn()
    const getInstance = jest.spyOn(loggerService, 'getInstance').mockReturnValue({
      info,
    })

    const message = 'message'
    loggerService.logInfo(message)

    expect(getInstance).toBeCalled()
    expect(info).toBeCalledWith(message)
  })

  it('should log with the warning level', () => {
    const warn = jest.fn()
    const getInstance = jest.spyOn(loggerService, 'getInstance').mockReturnValue({
      warn,
    })

    const message = 'message'
    loggerService.logWarning(message)

    expect(getInstance).toBeCalled()
    expect(warn).toBeCalledWith(message)
  })

  it('should log with the error level', () => {
    const error = jest.fn()
    const getInstance = jest.spyOn(loggerService, 'getInstance').mockReturnValue({
      error,
    })

    const message = 'message'
    loggerService.logError(message)

    expect(getInstance).toBeCalled()
    expect(error).toBeCalledWith(message)
  })
})
