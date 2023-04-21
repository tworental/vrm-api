const config = require('config')

const stripe = require('../../../../../services/stripe')
const { handler } = require('../../../../../services/http')
const { frontendUrl } = require('../../../../../services/frontend')
const { updateBy } = require('../../../../../models/v1/accounts/repositories')

jest.mock('config')
jest.mock('../../../../../services/stripe')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/frontend')
jest.mock('../../../../../models/v1/accounts/repositories')

const httpHandler = require('./session')

describe('POST /v1/app/billings/session', () => {
  const accountId = 'accountId'
  const email = 'email'
  const phoneNumber = 'phoneNumber'
  const identifier = 'identifier'
  const stripeId = 'stripeId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a stripe session', async () => {
    const customerId = 'customerId'
    const session = 'session'
    const billingUrl = 'billingUrl'

    const json = jest.fn().mockImplementation((args) => args)
    config.get.mockImplementation((args) => args)

    stripe.customers.upsert.mockResolvedValue(customerId)
    stripe.billingPortal.createSession.mockResolvedValue(session)
    frontendUrl.mockReturnValue(billingUrl)

    await expect(httpHandler({
      user: { accountId, email, phoneNumber }, account: { identifier, stripeId },
    }, { json }))
      .resolves.toEqual({ data: session })
    expect(handler).toBeCalled()
    expect(stripe.customers.upsert).toBeCalledWith({
      accountId, stripeId, email, identifier, phoneNumber,
    })
    expect(updateBy).toBeCalledWith({ id: accountId }, { stripeId: customerId })
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.billing',
    )
    expect(stripe.billingPortal.createSession).toBeCalledWith(customerId, billingUrl)
    expect(json).toBeCalledWith({ data: session })
  })

  it('should create a stripe session without updating account', async () => {
    const customerId = stripeId
    const session = 'session'
    const billingUrl = 'billingUrl'

    const json = jest.fn().mockImplementation((args) => args)
    config.get.mockImplementation((args) => args)

    stripe.customers.upsert.mockResolvedValue(customerId)
    stripe.billingPortal.createSession.mockResolvedValue(session)
    frontendUrl.mockReturnValue(billingUrl)

    await expect(httpHandler({
      user: { accountId, email, phoneNumber }, account: { identifier, stripeId },
    }, { json }))
      .resolves.toEqual({ data: session })
    expect(stripe.customers.upsert).toBeCalledWith({
      accountId, stripeId, email, identifier, phoneNumber,
    })
    expect(updateBy).not.toBeCalled()
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.billing',
    )
    expect(stripe.billingPortal.createSession).toBeCalledWith(customerId, billingUrl)
    expect(json).toBeCalledWith({ data: session })
  })
})
