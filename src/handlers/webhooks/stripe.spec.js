/* eslint-disable no-console */
const cache = require('../../services/cacheManager')
const { handler } = require('../../services/http')
const { webhookEvent } = require('../../services/stripe')
const {
  updateBy: updateAccountBy,
} = require('../../models/v1/accounts/repositories')
const {
  create: createSubscription,
  updateBy: updateSubscription,
  deleteBy: deleteSubscriptions,
} = require('../../models/v1/billing/subscriptions/repositories')
const { selectOneBy: getPackageBy } = require('../../models/v1/packages/repositories')

jest.mock('../../services/cacheManager')
jest.mock('../../services/http')
jest.mock('../../services/stripe')
jest.mock('../../models/v1/accounts/repositories')
jest.mock('../../models/v1/billing/subscriptions/repositories')
jest.mock('../../models/v1/packages/repositories')

const httpHandler = require('./stripe')

describe('POST /webhooks/stripe', () => {
  const headers = {
    'stripe-signature': 'stripe-signature',
  }

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should handle invoice.payment_failed type', async () => {
    const results = 200
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const rawBody = 'rawBody'

    const event = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          subscription: 'subscription',
          metadata: {
            identifier: 'identifier',
            account_id: 'account_id',
          },
        },
      },
    }

    const data = event.data.object

    webhookEvent.mockResolvedValue(event)

    await expect(httpHandler({ rawBody, headers }, { sendStatus }))
      .resolves.toBe(results)
    expect(handler).toBeCalled()
    expect(webhookEvent).toBeCalledWith(rawBody, headers['stripe-signature'])
    expect(updateSubscription).toBeCalledWith({ stripeSubscriptionId: data.subscription }, {
      status: 'unpaid',
    })
    expect(cache.del).toBeCalledWith([
      `accounts.${data.metadata.identifier}.*`,
      `accounts.${data.metadata.account_id}.*`,
    ])
  })

  it('should handle customer.subscription.deleted type', async () => {
    const results = 200
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const rawBody = 'rawBody'

    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'id',
          subscription: 'subscription',
          customer: 'customer',
          default_payment_method: 'default_payment_method',
          status: 'deleted',
          quantity: 'quantity',
          start_date: 100000,
          current_period_start: 100000,
          current_period_end: 100000,
          plan: {
            id: 'plan-id',
            product: 'product-id',
            interval: 'interval',
            intervalCount: 'interval_count',
          },
          metadata: {
            identifier: 'identifier',
            account_id: 'account_id',
          },
        },
      },
    }

    const data = event.data.object

    webhookEvent.mockResolvedValue(event)

    await expect(httpHandler({ rawBody, headers }, { sendStatus }))
      .resolves.toBe(results)
    expect(webhookEvent).toBeCalledWith(rawBody, headers['stripe-signature'])
    expect(updateSubscription).toBeCalledWith({ accountId: data.metadata.account_id, stripeSubscriptionId: data.id }, {
      stripeCustomerId: data.customer,
      stripeSubscriptionId: data.id,
      stripePriceId: data.plan.id,
      stripeProductId: data.plan.product,
      stripePaymentMethodId: data.default_payment_method,
      status: data.status,
      interval: data.plan.interval,
      intervalCount: data.plan.interval_count,
      quantity: data.quantity,
      startDate: expect.any(Date),
      cancellationDate: expect.any(Date),
      currentPeriodStartDate: expect.any(Date),
      currentPeriodEndDate: expect.any(Date),
    })
    expect(cache.del).toBeCalledWith([
      `accounts.${data.metadata.identifier}.*`,
      `accounts.${data.metadata.account_id}.*`,
    ])
  })

  it('should handle checkout.session.completed status', async () => {
    const results = 200
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const rawBody = 'rawBody'

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'customer',
          metadata: {
            identifier: 'identifier',
            account_id: 'account_id',
          },
        },
      },
    }

    const data = event.data.object

    webhookEvent.mockResolvedValue(event)

    await expect(httpHandler({ rawBody, headers }, { sendStatus }))
      .resolves.toBe(results)
    expect(webhookEvent).toBeCalledWith(rawBody, headers['stripe-signature'])
    expect(updateAccountBy).toBeCalledWith({ id: data.metadata.account_id }, {
      stripeId: data.customer,
      trialExpirationOn: null,
    })
    expect(cache.del).toBeCalledWith([
      `accounts.${data.metadata.identifier}.*`,
      `accounts.${data.metadata.account_id}.*`,
    ])
  })

  it('should handle customer.subscription.created type', async () => {
    const results = 200
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const rawBody = 'rawBody'
    const packageId = 'packageId'

    getPackageBy.mockResolvedValue({ id: packageId })

    const event = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'id',
          subscription: 'subscription',
          customer: 'customer',
          default_payment_method: 'default_payment_method',
          status: 'deleted',
          quantity: 'quantity',
          start_date: 100000,
          current_period_start: 100000,
          current_period_end: 100000,
          plan: {
            id: 'plan-id',
            product: 'product-id',
            interval: 'interval',
            intervalCount: 'interval_count',
          },
          metadata: {
            identifier: 'identifier',
            account_id: 'account_id',
          },
        },
      },
    }

    const data = event.data.object

    webhookEvent.mockResolvedValue(event)

    await expect(httpHandler({ rawBody, headers }, { sendStatus }))
      .resolves.toBe(results)
    expect(webhookEvent).toBeCalledWith(rawBody, headers['stripe-signature'])
    expect(createSubscription).toBeCalledWith({
      accountId: data.metadata.account_id,
      packageId,
      stripeCustomerId: data.customer,
      stripeSubscriptionId: data.id,
      stripePriceId: data.plan.id,
      stripeProductId: data.plan.product,
      stripePaymentMethodId: data.default_payment_method,
      status: data.status,
      interval: data.plan.interval,
      intervalCount: data.plan.interval_count,
      quantity: data.quantity,
      startDate: expect.any(Date),
      currentPeriodStartDate: expect.any(Date),
      currentPeriodEndDate: expect.any(Date),
    })
    expect(getPackageBy).toBeCalledWith({ stripeId: data.plan.product })
    expect(cache.del).toBeCalledWith([
      `accounts.${data.metadata.identifier}.*`,
      `accounts.${data.metadata.account_id}.*`,
    ])
  })

  it('should handle customer.subscription.updated type', async () => {
    const results = 200
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const rawBody = 'rawBody'
    const packageId = 'packageId'

    getPackageBy.mockResolvedValue({ id: packageId })

    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'id',
          subscription: 'subscription',
          customer: 'customer',
          default_payment_method: 'default_payment_method',
          status: 'active',
          quantity: 'quantity',
          start_date: 100000,
          current_period_start: 100000,
          current_period_end: 100000,
          plan: {
            id: 'plan-id',
            product: 'product-id',
            interval: 'interval',
            intervalCount: 'interval_count',
          },
          metadata: {
            identifier: 'identifier',
            account_id: 'account_id',
          },
        },
      },
    }

    const data = event.data.object

    webhookEvent.mockResolvedValue(event)

    await expect(httpHandler({ rawBody, headers }, { sendStatus }))
      .resolves.toBe(results)
    expect(webhookEvent).toBeCalledWith(rawBody, headers['stripe-signature'])
    expect(updateSubscription).toBeCalledWith({ accountId: data.metadata.account_id, stripeSubscriptionId: data.id }, {
      packageId,
      stripeCustomerId: data.customer,
      stripeSubscriptionId: data.id,
      stripePriceId: data.plan.id,
      stripeProductId: data.plan.product,
      stripePaymentMethodId: data.default_payment_method,
      status: data.status,
      interval: data.plan.interval,
      intervalCount: data.plan.interval_count,
      quantity: data.quantity,
      startDate: expect.any(Date),
      currentPeriodStartDate: expect.any(Date),
      currentPeriodEndDate: expect.any(Date),
    })
    expect(updateAccountBy).toBeCalledWith({ id: data.metadata.account_id }, {
      packageId,
    })
    expect(deleteSubscriptions).toBeCalledWith({ accountId: data.metadata.account_id, status: 'unpaid' })
    expect(getPackageBy).toBeCalledWith({ stripeId: data.plan.product })
    expect(cache.del).toBeCalledWith([
      `accounts.${data.metadata.identifier}.*`,
      `accounts.${data.metadata.account_id}.*`,
    ])
  })

  it('should handle customer.subscription.updated type for deleted status', async () => {
    const results = 200
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const rawBody = 'rawBody'
    const packageId = 'packageId'

    getPackageBy.mockResolvedValue({ id: packageId })

    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'id',
          subscription: 'subscription',
          customer: 'customer',
          default_payment_method: 'default_payment_method',
          status: 'deleted',
          quantity: 'quantity',
          start_date: 100000,
          current_period_start: 100000,
          current_period_end: 100000,
          plan: {
            id: 'plan-id',
            product: 'product-id',
            interval: 'interval',
            intervalCount: 'interval_count',
          },
          metadata: {
            identifier: 'identifier',
            account_id: 'account_id',
          },
        },
      },
    }

    const data = event.data.object

    webhookEvent.mockResolvedValue(event)

    await expect(httpHandler({ rawBody, headers }, { sendStatus }))
      .resolves.toBe(results)
    expect(webhookEvent).toBeCalledWith(rawBody, headers['stripe-signature'])
    expect(updateSubscription).toBeCalledWith({ accountId: data.metadata.account_id, stripeSubscriptionId: data.id }, {
      packageId,
      stripeCustomerId: data.customer,
      stripeSubscriptionId: data.id,
      stripePriceId: data.plan.id,
      stripeProductId: data.plan.product,
      stripePaymentMethodId: data.default_payment_method,
      status: data.status,
      interval: data.plan.interval,
      intervalCount: data.plan.interval_count,
      quantity: data.quantity,
      startDate: expect.any(Date),
      currentPeriodStartDate: expect.any(Date),
      currentPeriodEndDate: expect.any(Date),
    })
    expect(getPackageBy).toBeCalledWith({ stripeId: data.plan.product })
    expect(cache.del).toBeCalledWith([
      `accounts.${data.metadata.identifier}.*`,
      `accounts.${data.metadata.account_id}.*`,
    ])
  })
})
