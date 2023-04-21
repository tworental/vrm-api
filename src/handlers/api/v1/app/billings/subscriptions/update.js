const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const createError = require('../../../../../../services/errors')
const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')

const {
  selectOneBy,
} = require('../../../../../../models/v1/billing/subscriptions/repositories')

module.exports = handler(async ({ user: { accountId }, params: { id }, body: { quantity, price } }, res) => {
  const subscription = await selectOneBy({ id, accountId })

  if (!subscription) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)

  if (!stripeSubscription) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  try {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
      items: [{
        id: stripeSubscription.items.data[0].id,
        price,
        quantity,
      }],
    })
  } catch (err) {
    throw createError(422, MESSAGES.UNPROCESSABLE_ENTITY, { code: CODES.UNPROCESSABLE_ENTITY })
  }

  return res.sendStatus(204)
})
