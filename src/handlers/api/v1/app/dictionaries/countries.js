const { handler } = require('../../../../../services/http')
const { selectAll } = require('../../../../../models/v1/dict-countries/repositories')

module.exports = handler(async (req, res) => {
  const data = selectAll()

  return res.json({ data })
})
