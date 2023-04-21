#!/usr/bin/env node

const queueSubscriber = require('./queueSubscriber')

module.exports = async () => {
  await queueSubscriber()
}
