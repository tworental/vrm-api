const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/dict-amenities/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-amenities/repositories')

const httpHandler = require('./amenities')

describe('GET /v1/app/dictionaries/amenities', () => {
  it('should return room types list', async () => {
    const data = [{
      id: 'id',
      name: 'name',
      category: 'category',
      type: 'type',
    }]
    const type = 'type'
    const query = { type }
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)
    const queryOrWhereNull = jest.fn()
    const queryWhere = jest.fn().mockReturnValue({ orWhereNull: queryOrWhereNull })
    const queryBuilder = { where: queryWhere }

    const whereFn = jest.fn().mockImplementation((fn) => {
      fn(queryBuilder)
      return data
    })

    cache.wrap.mockImplementation((key, ttl, fn) => fn())
    selectBy.mockReturnValue({ where: whereFn })

    await expect(httpHandler({ query }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('dictionaries.amenities.type', 7200, expect.any(Function))
    expect(selectBy).toBeCalled()
    expect(whereFn).toBeCalledWith(expect.any(Function))
    expect(queryWhere).toBeCalledWith('type', type)
    expect(queryOrWhereNull).toBeCalledWith('type')
    expect(selectBy).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
