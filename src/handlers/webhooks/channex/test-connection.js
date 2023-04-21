const { handler } = require('../../../services/http')

module.exports = handler(async ({ query }, res) => {
  // eslint-disable-next-line no-console
  console.log(query)
  return res.sendStatus(200)
})
