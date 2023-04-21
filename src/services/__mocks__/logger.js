const logger = {}

logger.getInstance = jest.fn().mockImplementation((args) => args)
logger.logDebug = jest.fn()
logger.logInfo = jest.fn()
logger.logWarning = jest.fn()
logger.logError = jest.fn()

logger.logStream = {}
logger.logStream.write = jest.fn()

module.exports = logger
