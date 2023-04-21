const createError = require('../../../../../../services/errors')
const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')

const {
  selectOneBy,
} = require('../../../../../../models/v1/billing/subscriptions/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/stripe')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/billing/subscriptions/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/billings/subscriptions/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const quantity = 1
  const price = 100

  it('should update a resource', async () => {
    const results = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue({ stripeSubscriptionId: 'subId' })
    stripe.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [
          { id: 'price-1' },
        ],
      },
    })

    await expect(httpHandler({ user: { accountId }, params: { id }, body: { quantity, price } }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(stripe.subscriptions.retrieve).toBeCalledWith('subId')
    expect(stripe.subscriptions.update).toBeCalledWith('subId', {
      cancel_at_period_end: false,
      items: [{
        id: 'price-1',
        price,
        quantity,
      }],
    })
    expect(sendStatus).toBeCalledWith(results)
  })

  it('should throw Not Found for subscription', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body: { quantity, price } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw Not Found for stripe subscription', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue({ stripeSubscriptionId: 'subId' })
    stripe.subscriptions.retrieve.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body: { quantity, price } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(stripe.subscriptions.retrieve).toBeCalledWith('subId')
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw Unprocessable Error', async () => {
    const errorMessage = 'Unprocessable Entity'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue({ stripeSubscriptionId: 'subId' })
    stripe.subscriptions.retrieve.mockResolvedValue({
      items: {
        data: [
          { id: 'price-1' },
        ],
      },
    })

    stripe.subscriptions.update.mockRejectedValue('error')

    await expect(httpHandler({ user: { accountId }, params: { id }, body: { quantity, price } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(stripe.subscriptions.retrieve).toBeCalledWith('subId')
    expect(stripe.subscriptions.update).toBeCalledWith('subId', {
      cancel_at_period_end: false,
      items: [{
        id: 'price-1',
        price,
        quantity,
      }],
    })
    expect(createError).toBeCalledWith(422, errorMessage, {
      code: 'UNPROCESSABLE_ENTITY',
    })
  })
})
