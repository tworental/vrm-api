const config = require('config')
const { Consumer } = require('sqs-consumer')

const { SQS } = require('./aws')

const { logDebug, logInfo, logError } = require('./logger')

const createClient = () => {
  let sqsClient
  return (invalidate = false) => {
    if (sqsClient === undefined || invalidate) {
      sqsClient = new SQS({
        accessKeyId: config.get('aws.accessKey'),
        secretAccessKey: config.get('aws.accessSecretKey'),
        apiVersion: '2012-11-05',
        region: config.get('aws.region'),
      })
    }
    return sqsClient
  }
}

exports.getClient = createClient()

const withClientAndUrl = (fn) => async (queueName) => {
  const client = exports.getClient()
  const { QueueUrl: url } = await client.getQueueUrl({ QueueName: queueName }).promise()
  return fn(client, url)
}

exports.subscribe = withClientAndUrl((client, url) => (handler, messageAttributeNames) => {
  const withLogger = (subHandler) => (message) => {
    logInfo('sqs-queue-message-received', {
      id: message.MessageId,
      attributes: message.Attributes,
    })

    logDebug('sqs-queue-message-body-received', {
      body: message.Body,
    })
    return subHandler(message)
  }

  const withJsonParser = (subHandler) => (message) => subHandler(JSON.parse(message.Body))

  const consumer = Consumer.create({
    attributeNames: ['All'],
    messageAttributeNames,
    queueUrl: url,
    handleMessage: withLogger(withJsonParser(handler)),
    sqs: client,
  })

  consumer.start()

  const logQueueError = (error) => logError('sqs-queue-message-failed', {
    errorMessage: error.message,
    stack: error.stack,
    ...error,
  })

  consumer.on('error', logQueueError)
  consumer.on('processing_error', logQueueError)
  consumer.on('timeout_error', logQueueError)

  logInfo('sqs-queue-subscribed', { url })

  return consumer
})

exports.publish = withClientAndUrl((client, url) => (message, attributes) => {
  logInfo('sqs-queue-message-published', {
    url,
    attributes,
  })

  logDebug('sqs-queue-message-body-published', {
    body: message,
  })

  return client.sendMessage({
    QueueUrl: url,
    MessageBody: JSON.stringify(message),
    MessageAttributes: attributes,
  }).promise()
})
