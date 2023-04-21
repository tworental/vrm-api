const config = require('config')

exports.debugInfo = (res, data) => {
  if (config.get('debug.enabled')) {
    res.header(config.get('debug.key'), Buffer.from(JSON.stringify(data)).toString('base64'))
  }
}
