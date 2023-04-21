const { handler } = require('../../../../services/http')

module.exports = handler(({ limits }, res) => (
  res.json({ data: limits })
))
