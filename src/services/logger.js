const {
  createLogger,
  transports: { Console },
  format,
} = require('winston')
const config = require('config')

const createInstance = () => {
  let logger
  return (invalidate = false) => {
    if (logger === undefined || invalidate) {
      logger = createLogger({
        level: config.get('logger.level'),
        format: format.combine(
          ...config.get('logger.formats').map((configFormat) => format[configFormat]()),
        ),
        exitOnError: false,
      })
      logger.add(new Console())
    }
    return logger
  }
}

exports.getInstance = createInstance()

exports.logDebug = (...args) => exports.getInstance().debug(...args)
exports.logInfo = (...args) => exports.getInstance().info(...args)
exports.logWarning = (...args) => exports.getInstance().warn(...args)
exports.logError = (...args) => exports.getInstance().error(...args)

exports.logStream = {
  write(message) {
    exports.logInfo(message.substring(0, message.lastIndexOf('\n')))
  },
}
