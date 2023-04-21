const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-arrangements/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-arrangements/repositories')

const httpHandler = require('./arrangements')

describe('GET /v1/app/dictionaries/arrangements', () => {
  it('should return room types list', async () => {
    const data = ['data']
    const type = 'type'

    const query = { type }
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, ttl, fn) => fn())
    selectBy.mockResolvedValue(data)

    await expect(httpHandler({ query }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('dictionaries.arrangements.type', 7200, expect.any(Function))
    expect(selectBy).toBeCalledWith({ type })
    expect(json).toBeCalledWith(response)
  })
})
