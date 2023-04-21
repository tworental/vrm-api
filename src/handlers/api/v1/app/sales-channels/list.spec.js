const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/sales-channels/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/sales-channels/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/sales-channels', () => {
  it('should display all resources', async () => {
    const accountId = 'accountId'
    const data = ['sales-channel']

    const json = jest.fn().mockImplementation((args) => args)

    selectBy.mockResolvedValue(data)

    await expect(httpHandler({ user: { accountId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId })
    expect(json).toBeCalledWith({ data })
  })
})
