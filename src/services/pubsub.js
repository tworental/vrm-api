const PubSub = require('pubsub-js')

exports.subscribe = (topic, handler) => PubSub.subscribe(topic, handler)

exports.publish = (topic, data) => PubSub.publish(topic, data)
