const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')

jest.mock('../../../../../../services/stripe')
jest.mock('../../../../../../services/http')

const httpHandler = require('./show')

describe('GET /v1/app/billings/checkout/:id', () => {
  const id = 'id'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display a resource', async () => {
    const session = 'session'
    stripe.checkout.retrieveSession.mockResolvedValue(session)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ params: { id } }, { json }))
      .resolves.toEqual({ data: session })

    expect(handler).toBeCalled()
    expect(stripe.checkout.retrieveSession).toBeCalledWith(id)
    expect(json).toBeCalledWith({ data: session })
  })
})
