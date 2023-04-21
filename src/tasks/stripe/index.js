#!/usr/bin/env node

const { logError } = require('../../services/logger')
const fixtures = require('./fixtures')

module.exports = async (action, context) => {
  switch (action) {
    case 'get':
      break

    case 'set':
      switch (context) {
        case 'fixtures':
          await fixtures()
          break

        default:
          logError(`Stripe "${context}" context for "set" action is not supported!`)
          break
      }

      break

    default:
      logError(`Stripe "${action}" action is not supported!`)
      break
  }
}
