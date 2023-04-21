const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-fees/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-fees/repositories')

const httpHandler = require('./fees')

describe('GET /v1/app/dictionaries/fees', () => {
  it('should return services list', async () => {
    const data = [{
      id: 'id',
      name: 'name',
    }]
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, ttl, fn) => fn())
    selectBy.mockResolvedValue(data)

    await expect(httpHandler({}, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('dictionaries.fees', 7200, expect.any(Function))
    expect(selectBy).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
