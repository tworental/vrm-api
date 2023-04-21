const config = require('config')
const { WebClient } = require('@slack/web-api')

const { logError } = require('./logger')

const createInstance = () => {
  let client
  return (invalidate = false) => {
    if (client === undefined || invalidate) {
      client = new WebClient(config.get('slack.token'))
    }
    return client
  }
}

exports.init = createInstance()

exports.postMessage = (channel, text) => {
  if (!config.get('slack.token')) {
    return Promise.resolve()
  }

  const prefix = process.env.NODE_ENV !== 'production' ? `*[${process.env.NODE_ENV}]*` : ''

  return exports
    .init()
    .chat.postMessage({
      text: `${prefix} ${text}`,
      channel,
      username: 'TwoRentals Bot',
    })
    .catch((err) => logError('slack-integration-error', err))
}
