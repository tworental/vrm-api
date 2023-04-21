const { handler } = require('../../../../../services/http')
const { occupancyByYear } = require('../../../../../models/v1/statistics/repositories')

const CURRENT_YEAR = new Date().getFullYear()

module.exports = handler(async ({
  user: { accountId },
  query: {
    year: currentYear = CURRENT_YEAR,
    compareToYear,
    propertyId,
  },
}, res) => {
  const results = await occupancyByYear(accountId)([currentYear, compareToYear || currentYear - 1], propertyId)

  const data = Object.entries(results).map(([year, items]) => ({
    year,
    data: items.map((payload) => {
      const unitsNumber = payload.length

      let occupancy = payload.map(({ totalNights, daysInMonth }) => (
        totalNights !== daysInMonth ? (totalNights / daysInMonth) : 1
      )).reduce((a, b) => a + b, 0)

      if (occupancy > 0) {
        occupancy = Math.round((((occupancy / unitsNumber) * 100) + Number.EPSILON) * 100) / 100
      }

      return { unitsNumber, occupancy }
    }),
  }))

  return res.json({ data })
})
