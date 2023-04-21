const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { amountByCurrency } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { occupancyByYear } = require('../../../../../models/v1/statistics/repositories')

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
  const results = await occupancyByYear(accountId)([currentYear, compareToYear || currentYear - 1], propertyId)

  const calculateTotalRate = await amountByCurrency(settings.currency)

  const data = Object.entries(results).map(([year, items]) => ({
    year,
    labels: Array.from(Array(12).keys()),
    ...items.reduce((acc, curr) => {
      const nights = roundTo(curr.reduce((a, { totalNights }) => a + totalNights, 0), 2)

      acc.data = [
        ...acc.data,
        nights,
      ]

      acc.averagePrice = [
        ...acc.averagePrice,
        roundTo(
          curr.reduce(
            (a, { amount, currency, totalNights }) => a + calculateTotalRate(amount, currency) * totalNights, 0,
          ) / (nights || 1),
          2,
        ),
      ]
      return acc
    }, { data: [], averagePrice: [] }),
  }))

  return res.json({ data })
})
