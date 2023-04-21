const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-guest-types/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-guest-types/repositories')

const httpHandler = require('./guestTypes')

describe('GET /v1/app/dictionaries/guest-types', () => {
  it('should return guest types list', async () => {
    const data = ['data']
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, ttl, fn) => fn())
    selectBy.mockResolvedValue(data)

    await expect(httpHandler({}, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('dictionaries.guestTypes', 7200, expect.any(Function))
    expect(selectBy).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
