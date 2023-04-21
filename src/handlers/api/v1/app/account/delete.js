const { handler } = require('../../../../../services/http')

module.exports = handler(({ account }, res) => (
  // TODO: add deletion account functionality (with canceling subscription etc.)
  res.json({ data: account })
))
