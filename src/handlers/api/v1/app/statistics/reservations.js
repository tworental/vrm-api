const { handler } = require('../../../../../services/http')
const { amountByCurrency } = require('../../../../../models/v1/dict-currency-rates/repositories')
const { reservationsByCountry } = require('../../../../../models/v1/statistics/repositories')

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
  const { labels, data } = await reservationsByCountry(accountId)(
    [currentYear, compareToYear || currentYear - 1],
    propertyId,
  )

  const calculateTotalRate = await amountByCurrency(settings.currency)

  const results = Object.entries(data).map(([year, items]) => {
    const averageRate = items.map(({ currency, total }) => calculateTotalRate(total, currency))

    return {
      year,
      labels,
      data: averageRate.map((amount) => (
        amount * (100 / averageRate.reduce((a, b) => (a + b), 0))
      )),
      averageRate,
      currency: settings.currency,
    }
  })

  return res.json({ data: results })
})
