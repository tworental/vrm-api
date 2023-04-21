const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { getLanguagesList } = require('../../../../../services/translate')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/translate')

const httpHandler = require('./list')

describe('GET /v1/app/languages', () => {
  it('should display all resources', async () => {
    const data = 'results'

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, ttl, fn) => fn())
    getLanguagesList.mockResolvedValue(data)

    await expect(httpHandler({ }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('api.languages', 43200, expect.any(Function))
    expect(getLanguagesList).toBeCalled()
    expect(json).toBeCalledWith({ data })
  })
})
