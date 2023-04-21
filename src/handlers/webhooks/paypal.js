const { handler } = require('../../services/http')
const { verifyIpn } = require('../../services/paypal')

module.exports = handler(async ({ body }, res) => {
  const response = await verifyIpn(body)

  // eslint-disable-next-line no-console
  console.log(response)

  return res.sendStatus(200)
})
