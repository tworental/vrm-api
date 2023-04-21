const config = require('config')

const dao = require('../../../services/dao')

const { TABLE_NAME } = require('./constants')

const trialExpirationDate = () => {
  const trialPeriod = Number(config.get('payments.trialPeriod'))

  return !Number.isNaN(trialPeriod)
    ? new Date(Date.now() + trialPeriod * 24 * 60 * 60 * 1000)
    : null
}

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    trialExpirationDate,
  },
})
