const config = require('config')
const stripe = require('stripe')

const createError = require('./errors')
const { snakecaseKeys } = require('./utility')

const createInstance = () => {
  let processor
  return (invalidate = false) => {
    if (processor === undefined || invalidate) {
      processor = stripe(config.get('payments.stripe.apiSecretKey'), {
        apiVersion: config.get('payments.stripe.version'),
        maxNetworkRetries: config.get('payments.stripe.maxNetworkRetries'),
      })
    }
    return processor
  }
}

exports.init = createInstance()

exports.handler = (fn) => async (...args) => {
  try {
    return await fn(...args)
  } catch (error) {
    switch (error.type) {
      case 'StripeInvalidRequestError':
        if (error.raw.code === 'parameter_unknown') {
          throw createError(error.statusCode, error.raw.message)
        }

        if (error.raw.param) {
          throw createError(error.statusCode, 'Validation failed', {
            errors: { [error.raw.param]: [error.raw.message] },
          })
        }

        throw createError(error.statusCode, error.raw.message)
      default:
        throw createError(error.statusCode, error.raw ? error.raw.message : error.errorMessage)
    }
  }
}

exports.billingPortal = {
  createSession: exports.handler((customer, returnUrl) => (
    exports.init().billingPortal.sessions.create(snakecaseKeys({
      customer,
      returnUrl,
    }))
  )),
}

exports.checkout = {
  retrieveSession: exports.handler((id) => (
    exports.init().checkout.sessions.retrieve(id)
  )),

  createSession: exports.handler((params) => (
    exports.init().checkout.sessions.create(snakecaseKeys({
      mode: 'subscription',
      paymentMethodTypes: ['card'],
      allowPromotionCodes: true,
      billingAddressCollection: 'required',
      ...params,
    }))
  )),
}

exports.customers = {
  retrieve: exports.handler((id) => (
    exports.init().customers.retrieve(id)
  )),

  list: exports.handler((params) => (
    exports.init().customers.list(params)
  )),

  update: exports.handler((id, params) => (
    exports.init().customers.update(id, params)
  )),

  create: exports.handler((params) => (
    exports.init().customers.create(params)
  )),

  upsert: exports.handler(async ({
    accountId, stripeId, email, identifier, phoneNumber,
  }) => {
    const payload = {
      email,
      phone: phoneNumber,
      description: `org. ${identifier}`,
      metadata: { accountId, identifier },
    }

    let customer = stripeId
      ? await exports.customers.retrieve(stripeId)
      : null

    if (customer && !customer.deleted) {
      await exports.customers.update(stripeId, payload)
    } else {
      customer = await exports.customers.list({ email })
        .then(({ data }) => data.find(({ metadata }) => metadata.accountId === accountId))

      if (!customer) {
        customer = await exports.customers.create(payload)
      }
    }
    return customer.id
  }),
}

exports.subscriptions = {
  list: exports.handler((params) => (
    exports.init().subscriptions.list(params)
  )),

  retrieve: exports.handler((id) => (
    exports.init().subscriptions.retrieve(id)
      .catch(() => null)
  )),

  update: exports.handler((id, params) => (
    exports.init().subscriptions.update(id, params)
  )),

  del: exports.handler((id) => (
    exports.init().subscriptions.del(id)
  )),
}

exports.prices = {
  list: exports.handler((params = {}) => (
    exports.init().prices.list({
      currency: config.get('payments.defaultCurrency'),
      ...params,
    })
  )),
}

exports.webhookEvent = exports.handler((rawBody, signature) => (
  exports.init().webhooks.constructEvent(
    rawBody,
    signature,
    config.get('payments.stripe.webhookSecret'),
  )
))
