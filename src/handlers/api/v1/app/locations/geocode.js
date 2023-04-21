const { handler } = require('../../../../../services/http')
const { geocode } = require('../../../../../services/geocode')

module.exports = handler(async ({ query }, res) => {
  const data = await geocode(query)

  return res.json({ data })
})
