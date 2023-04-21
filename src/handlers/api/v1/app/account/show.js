const { handler } = require('../../../../../services/http')

module.exports = handler(({ account }, res) => (
  res.json({ data: account })
))
