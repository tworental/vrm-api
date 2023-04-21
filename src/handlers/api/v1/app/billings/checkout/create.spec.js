const config = require('config')

const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')
const { frontendUrl } = require('../../../../../../services/frontend')
const { validate } = require('../../../../../../services/validate')
const { selectBy: selectPackages } = require('../../../../../../models/v1/packages/repositories')
const { SCHEMA } = require('../../../../../../models/v1/billing/schema')

jest.mock('config')
jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/stripe')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/frontend')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/packages/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/billings/checkout', () => {
  const id = 'user-id'
  const accountId = 'accountId'
  const email = 'email'
  const lang = 'lang'
  const identifier = 'identifier'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const data = 'session'
    const body = {
      prices: [
        { id: 'price-1', quantity: 2 },
        { id: 'price-2', quantity: 2 },
        { id: 'price-3', quantity: 2 },
      ],
    }
    const packages = [
      { stripeId: 'stripe-1' },
      { stripeId: 'stripe-2' },
      { stripeId: 'stripe-3' },
    ]
    const successUrl = 'successUrl'
    const cancelUrl = 'cancelUrl'
    const metadata = {
      accountId,
      identifier,
    }

    validate.mockResolvedValue(body)
    selectPackages.mockResolvedValue(packages)
    stripe.prices.list.mockResolvedValue({
      data: [
        { id: 'price-1', quantity: 2, product: { id: 'stripe-1' } },
        { id: 'price-2', quantity: 2, product: { id: 'stripe-2' } },
        { id: 'price-3', quantity: 2, product: { id: 'stripe-3' } },
      ],
    })

    config.get.mockImplementation((args) => args)

    frontendUrl.mockReturnValueOnce(successUrl)
    frontendUrl.mockReturnValueOnce(cancelUrl)

    stripe.checkout.createSession.mockResolvedValue(data)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({
      body, headers: { lang }, user: { id, accountId, email }, account: { identifier },
    }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: SCHEMA })
    expect(selectPackages).toBeCalled()
    expect(stripe.prices.list).toBeCalledWith({
      active: true,
      expand: ['data.tiers', 'data.product'],
    })
    expect(stripe.checkout.createSession).toBeCalledWith({
      clientReferenceId: id,
      customerEmail: email,
      locale: lang,
      lineItems: body.prices.map(({ id: price, quantity }) => ({ price, quantity })),
      successUrl,
      cancelUrl,
      metadata,
      subscriptionData: {
        metadata,
      },
    })
    expect(config.get).toBeCalledWith('frontend.app.endpoint')
    expect(config.get).toBeCalledWith('frontend.app.paths.checkoutSuccess')
    expect(config.get).toBeCalledWith('frontend.app.paths.checkoutCancel')
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.checkoutSuccess',
    )
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.checkoutCancel',
    )
    expect(cache.del).toBeCalledWith([`accounts.${accountId}.*`])
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error for not passed prices', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const body = {
      prices: [],
    }
    const packages = [
      { stripeId: 'stripe-1' },
      { stripeId: 'stripe-2' },
      { stripeId: 'stripe-3' },
    ]

    validate.mockResolvedValue(body)
    selectPackages.mockResolvedValue(packages)
    stripe.prices.list.mockResolvedValue({
      data: [
        { id: 'price-1', quantity: 2, product: { id: 'stripe-1' } },
        { id: 'price-2', quantity: 2, product: { id: 'stripe-2' } },
        { id: 'price-3', quantity: 2, product: { id: 'stripe-3' } },
      ],
    })

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({
      body, headers: { lang }, user: { id, accountId, email }, account: { identifier },
    }, { json }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: SCHEMA })
    expect(selectPackages).toBeCalled()
    expect(stripe.prices.list).toBeCalledWith({
      active: true,
      expand: ['data.tiers', 'data.product'],
    })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { price: ['required'] },
    })
  })
})
