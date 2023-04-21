const config = require('config')

const stripe = require('../../../../../services/stripe')
const { handler } = require('../../../../../services/http')
const { frontendUrl } = require('../../../../../services/frontend')
const { updateBy } = require('../../../../../models/v1/accounts/repositories')

module.exports = handler(async ({
  user: { accountId, email, phoneNumber }, account: { identifier, stripeId },
}, res) => {
  const customerId = await stripe.customers.upsert({
    accountId, stripeId, email, identifier, phoneNumber,
  })

  if (stripeId !== customerId) {
    await updateBy({ id: accountId }, { stripeId: customerId })
  }

  const data = await stripe.billingPortal.createSession(customerId, frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.billing'),
  ))

  return res.json({ data })
})
