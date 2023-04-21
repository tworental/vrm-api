const PubSub = require('pubsub-js')

jest.mock('pubsub-js')

const service = require('./pubsub')

describe('pubsub service', () => {
  const topic = 'topic'
  const handler = 'handler'
  const data = 'data'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should call subscribe', () => {
    PubSub.subscribe = jest.fn()

    service.subscribe(topic, handler)

    expect(PubSub.subscribe).toBeCalledWith(topic, handler)
  })

  it('should call publish', () => {
    PubSub.publish = jest.fn()

    service.publish(topic, data)

    expect(PubSub.publish).toBeCalledWith(topic, data)
  })
})
