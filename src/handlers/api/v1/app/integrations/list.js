const cache = require('../../../../../services/cacheManager')
const stripe = require('../../../../../services/stripe')
const { handler } = require('../../../../../services/http')
const { selectBy, withAccount } = require('../../../../../models/v1/integrations/repositories')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const prices = await cache.wrap('stripe.prices', cache.TTL.H2, () => (
    stripe.prices.list({
      active: true,
      expand: ['data.product'],
    })
  ))

  const data = await cache.wrap(`accounts.${accountId}.integrations`, cache.TTL.H2, async () => {
    const integrations = await withAccount(accountId)(selectBy())

    return integrations.map((item) => {
      const price = prices.data.find(({ product }) => item.stripeId === product.id) || {}

      return {
        ...item,
        currency: price.currency,
        unitAmount: price.unit_amount,
      }
    })
  })

  return res.json({ data })
})
