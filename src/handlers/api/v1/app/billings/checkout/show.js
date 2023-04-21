const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')

module.exports = handler(async ({ params: { id } }, res) => {
  const data = await stripe.checkout.retrieveSession(id)

  return res.json({ data })
})
