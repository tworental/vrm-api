const pubsub = {
  // keeps all handlers to test
  stack: {},
}

pubsub.subscribe = jest.fn().mockImplementation((topic, handler) => {
  pubsub.stack[topic] = [...pubsub.stack[topic] || [], handler]
})

pubsub.publish = jest.fn()

module.exports = pubsub
