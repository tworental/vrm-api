const { handler } = require('../../../services/http')

module.exports = handler(async ({ body }, res) => {
  // eslint-disable-next-line no-console
  console.log(body)
  return res.sendStatus(200)
})
