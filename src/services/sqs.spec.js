const { Readable } = require('stream')
const { SQS } = require('aws-sdk')
const { Consumer } = require('sqs-consumer')
const config = require('config')
const { logDebug, logInfo, logError } = require('./logger')

const sqsService = require('./sqs')

jest.mock('aws-sdk')
jest.mock('sqs-consumer')
jest.mock('config')
jest.mock('./logger')

describe('sqs service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should create a client', () => {
    const sqsClient = { data: 'sqsClient' }
    SQS.mockImplementation(() => sqsClient)

    expect(sqsService.getClient(true)).toBe(sqsClient)

    expect(SQS).toBeCalledWith({
      accessKeyId: 'aws.accessKey',
      secretAccessKey: 'aws.accessSecretKey',
      apiVersion: '2012-11-05',
      region: 'aws.region',
    })

    expect(config.get).toHaveBeenNthCalledWith(1, 'aws.accessKey')
    expect(config.get).toHaveBeenNthCalledWith(2, 'aws.accessSecretKey')
    expect(config.get).toHaveBeenNthCalledWith(3, 'aws.region')
  })

  it('should get the same client on the next call', async () => {
    const sqsClient = { data: 'sqsClient' }
    SQS.mockImplementation(() => sqsClient)

    expect(sqsService.getClient(true)).toBe(sqsClient)
    expect(sqsService.getClient()).toBe(sqsClient)

    expect(SQS).toHaveBeenCalledTimes(1)
  })

  describe('subscribe', () => {
    const url = 'url'
    const promise = jest.fn().mockReturnValue({ QueueUrl: url })
    const getQueueUrl = jest.fn().mockReturnValue({ promise })
    const client = {
      data: 'client',
      getQueueUrl,
    }

    const consumer = new Readable()
    consumer.start = jest.fn()
    Consumer.create.mockReturnValue(consumer)

    let getClient
    beforeEach(() => {
      getClient = jest.spyOn(sqsService, 'getClient').mockReturnValue(client)
    })

    const handler = jest.fn()
    const messageAttributeNames = ['messageAttributeNames']
    const queueName = 'queueName'

    const error = {
      message: 'errorMessage',
      data: 'error',
    }

    it('should subscribe to a queue', async () => {
      Consumer.create.mockReturnValue(consumer)

      expect(
        (await sqsService.subscribe(queueName))(handler, messageAttributeNames),
      ).toEqual(consumer)

      expect(getClient).toBeCalled()
      expect(getQueueUrl).toBeCalledWith({ QueueName: queueName })
      expect(Consumer.create).toBeCalledWith({
        attributeNames: ['All'],
        messageAttributeNames,
        queueUrl: url,
        handleMessage: expect.any(Function),
        sqs: client,
      })

      expect(consumer.start).toBeCalled()
    })

    it('should pass messages to the handler', async () => {
      (await sqsService.subscribe(queueName))(handler, messageAttributeNames)

      const message = {
        MessageId: 32,
        Attributes: { data: 'attributes' },
        Body: '{"data":"body"}',
      }
      Consumer.create.mock.calls[0][0].handleMessage(message)

      logInfo('sqs-queue-message-received', {
        id: message.MessageId,
        attributes: message.Attributes,
      })

      logDebug('sqs-queue-message-body-received', {
        body: message.Body,
      })

      expect(handler).toHaveBeenCalledWith({ data: 'body' })
    })

    it('should handle an error event', async () => {
      (await sqsService.subscribe(queueName))(handler, messageAttributeNames)

      consumer.emit('error', error)
      expect(logError).toBeCalledWith('sqs-queue-message-failed', {
        errorMessage: error.message,
        ...error,
      })
    })

    it('should handle a processing error event', async () => {
      (await sqsService.subscribe(queueName))(handler, messageAttributeNames)

      consumer.emit('processing_error', error)
      expect(logError).toBeCalledWith('sqs-queue-message-failed', {
        errorMessage: error.message,
        ...error,
      })
    })

    it('should handle a timeout error event', async () => {
      (await sqsService.subscribe(queueName))(handler, messageAttributeNames)

      consumer.emit('timeout_error', error)
      expect(logError).toBeCalledWith('sqs-queue-message-failed', {
        errorMessage: error.message,
        ...error,
      })
    })
  })

  it('should publish to a queue', async () => {
    const url = 'url'
    const getQueueUrlPromise = jest.fn().mockReturnValue({ QueueUrl: url })
    const getQueueUrl = jest.fn().mockReturnValue({ promise: getQueueUrlPromise })
    const sendMessagePromiseReturn = 'sendMessagePromiseReturn'
    const sendMessagePromise = jest.fn().mockResolvedValue(sendMessagePromiseReturn)
    const sendMessage = jest.fn().mockReturnValue({ promise: sendMessagePromise })
    const client = {
      data: 'client',
      sendMessage,
      getQueueUrl,
    }
    const getClient = jest.spyOn(sqsService, 'getClient').mockReturnValue(client)

    const attributes = ['attributes']
    const message = {
      data: 'message',
    }
    const queueName = 'queueName'
    expect(await (await sqsService.publish(queueName))(message, attributes))
      .toEqual(sendMessagePromiseReturn)

    expect(getClient).toBeCalled()
    expect(getQueueUrl).toBeCalledWith({ QueueName: queueName })
    expect(sendMessage).toBeCalledWith({
      QueueUrl: url,
      MessageBody: '{"data":"message"}',
      MessageAttributes: attributes,
    })
  })
})
