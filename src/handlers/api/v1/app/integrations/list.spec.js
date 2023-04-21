const cache = require('../../../../../services/cacheManager')
const stripe = require('../../../../../services/stripe')
const { handler } = require('../../../../../services/http')
const { selectBy, withAccount } = require('../../../../../models/v1/integrations/repositories')

jest.mock('stripe')
jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/integrations/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/integrations', () => {
  it('should display all resources', async () => {
    const stripeId = 'productId'
    const accountId = 'accountId'
    const integration = { stripeId }

    const data = [
      {
        ...integration,
        currency: 'eur',
        unitAmount: 1000,
      },
      {
        id: 2,
        currency: undefined,
        unitAmount: undefined,
      },
    ]

    const stripePrice = {
      currency: 'eur',
      unit_amount: 1000,
      product: {
        id: stripeId,
      },
    }

    const withAccountMock = jest.fn().mockImplementation((fn) => fn)
    cache.wrap.mockImplementation((key, ttl, fn) => fn())

    selectBy.mockResolvedValue(data)

    withAccount.mockReturnValue(withAccountMock)

    const list = jest.spyOn(stripe.prices, 'list').mockReturnValue({ data: [stripePrice] })

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId } }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalled()
    expect(list).toBeCalledWith({
      active: true,
      expand: ['data.product'],
    })
    expect(json).toBeCalledWith({ data })
  })
})
