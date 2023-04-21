const { subscribe, stack } = require('../services/pubsub')
const { generateInvoice } = require('../models/v1/bookings/repositories')

jest.mock('../services/pubsub')
jest.mock('../models/v1/bookings/repositories')

require('./bookings')

describe('bookings listener', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize subscriber', () => {
    expect(subscribe).toBeCalledWith('statusChanged', expect.any(Function))
  })

  it('should generate invoice for confirmed status', async () => {
    const [fn] = stack.statusChanged

    const data = {
      status: 'confirmed',
    }

    await expect(fn(null, data))
      .resolves.toBeUndefined()

    expect(generateInvoice).toBeCalledWith(data)
  })

  it('should do nothing for other statuses', async () => {
    const [fn] = stack.statusChanged

    const data = {
      status: 'tentative',
    }

    await expect(fn(null, data))
      .resolves.toBeUndefined()

    expect(generateInvoice).not.toBeCalled()
  })
})
