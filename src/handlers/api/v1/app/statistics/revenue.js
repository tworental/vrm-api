const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { amountByCurrency } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { totalRevenue } = require('../../../../../models/v1/statistics/repositories')

const CURRENT_YEAR = new Date().getFullYear()

module.exports = handler(async ({
  user: { accountId },
  account: { settings },
  query: {
    year: currentYear = CURRENT_YEAR,
    compareToYear,
    propertyId,
  },
}, res) => {
  const comparedYear = compareToYear || currentYear - 1

  const results = await totalRevenue(accountId)([currentYear, comparedYear], propertyId)

  const calculateTotalRate = await amountByCurrency(settings.currency)

  const labels = Array.from(Array(12).keys())

  const comparedYearTotal = Object.values(results[comparedYear] || [])
    .reduce((acc, { currency, total }) => (
      acc + calculateTotalRate(total, currency)
    ), 0)

  const data = Object.entries(results).map(([year, items]) => {
    const revenue = items.map(({ currency, total }) => calculateTotalRate(total, currency))

    const total = revenue.reduce((a, b) => a + b, 0)

    const change = roundTo((total - comparedYearTotal) / comparedYearTotal, 2)

    return {
      year,
      labels,
      total,
      data: revenue,
      currency: settings.currency,
      change,
    }
  })

  return res.json({ data })
})
