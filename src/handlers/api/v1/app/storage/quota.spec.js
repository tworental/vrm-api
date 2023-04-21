const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { sum } = require('../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./quota')

describe('GET /v1/app/storage/quota', () => {
  it('should return quota details', async () => {
    const cacheKey = 'cacheKey'

    const accountId = 'accountId'
    const size = 1000

    const limits = [
      { name: 'other', value: 1000 },
      { name: 'account.module.storage.quota', value: 500000 },
    ]

    const results = {
      data: {
        size,
        quota: 500000,
      },
    }

    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)

    sum.mockResolvedValue({ sum: size })

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ limits, user: { accountId } }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.storage.quota', accountId)
    expect(sum).toBeCalledWith('size', { accountId })
    expect(json).toBeCalledWith(results)
  })
})
