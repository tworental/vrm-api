const config = require('config')

const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')
const { frontendUrl } = require('../../../../../../services/frontend')
const { validate } = require('../../../../../../services/validate')
const { selectBy: selectPackages } = require('../../../../../../models/v1/packages/repositories')
const { SCHEMA } = require('../../../../../../models/v1/billing/schema')

module.exports = handler(async ({
  body, headers: { lang }, user: { id, accountId, email }, account: { identifier },
}, res) => {
  const payload = await validate(body, { schema: SCHEMA })

  const stripeIds = await selectPackages()
    .then((packages) => packages.map((item) => item.stripeId))

  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.tiers', 'data.product'],
  }).then(({ data }) => data.filter((item) => stripeIds.includes(item.product.id)))

  const lineItems = payload.prices.filter((item) => (
    prices.map((price) => price.id).includes(item.id)
  )).map(({ id: price, quantity }) => ({ price, quantity }))

  if (!lineItems.length) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { price: ['required'] },
    })
  }

  const successUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.checkoutSuccess'),
  )

  const cancelUrl = frontendUrl(
    config.get('frontend.app.endpoint'),
    identifier,
    config.get('frontend.app.paths.checkoutCancel'),
  )

  const metadata = {
    accountId,
    identifier,
  }

  const data = await stripe.checkout.createSession({
    clientReferenceId: id,
    customerEmail: email,
    locale: lang,
    lineItems,
    successUrl,
    cancelUrl,
    metadata,
    subscriptionData: {
      metadata,
    },
  })

  cache.del([`accounts.${accountId}.*`])

  return res.json({ data })
})
