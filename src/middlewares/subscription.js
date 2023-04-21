const createError = require('../services/errors')
const cache = require('../services/cacheManager')
const { selectOneBy } = require('../models/v1/billing/subscriptions/repositories')
const { SUBSCRIPTION_STATUS } = require('../models/v1/billing/subscriptions/constants')

// NOTE: checking whether the user account is on trial period or not.
//  If not then we must check does the account subscription is active or inactive.
module.exports = async ({ account: { id, trialExpirationOn } }, res, next) => {
  try {
    const subscription = await cache.wrap(`accounts.${id}.subscriptions.active`, () => (
      selectOneBy({ accountId: id, status: SUBSCRIPTION_STATUS.ACTIVE })
    ))

    if (subscription) {
      return next()
    }

    if (!trialExpirationOn || new Date(Date.now()) < trialExpirationOn) {
      return next()
    }
    return next(createError(402, 'Account Expired'))
  } catch (error) {
    return next(error)
  }
}
