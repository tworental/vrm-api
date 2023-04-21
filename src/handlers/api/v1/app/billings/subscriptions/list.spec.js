const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')

const {
  selectBy,
} = require('../../../../../../models/v1/billing/subscriptions/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/billing/subscriptions/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/subscriptions', () => {
  it('should display all resources', async () => {
    const data = 'data'
    const accountId = 'accountId'
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, ttl, fn) => fn())
    selectBy.mockResolvedValue(data)

    await expect(httpHandler({ user: { accountId } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('accounts.accountId.subscriptions', 43200, expect.any(Function))
    expect(selectBy).toBeCalledWith({ accountId })
    expect(json).toBeCalledWith(response)
  })
})
