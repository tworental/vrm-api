#!/usr/bin/env node

const { logError } = require('../../services/logger')
const { select, insert } = require('../../services/database')

const generateAccountLimits = (accountId) => select('limits').then((results) => (
  Promise.all(
    results.map(({ id, name, value }) => insert('limit_accounts', {
      limit_id: id,
      account_id: accountId,
      annotation: name,
      value,
    })),
  )
))

module.exports = async (action, accountId) => {
  switch (action) {
    case 'set':
      await generateAccountLimits(accountId)
      break

    default:
      logError(`Stripe "${action}" action is not supported!`)
      break
  }
}
