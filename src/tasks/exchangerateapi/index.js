#!/usr/bin/env node

const { getLatestRates } = require('../../services/exchangerates')
const { create, selectOneBy } = require('../../models/v1/dict-currency-rates/repositories')

module.exports = async () => {
  if (!await selectOneBy().whereRaw('date < NOW() - INTERVAL 6 HOUR')) {
    const { rates, base, date } = await getLatestRates()

    await create({ rates, base, date })
  }
}
