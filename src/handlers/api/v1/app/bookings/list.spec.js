const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { filterBookings } = require('../../../../../models/v1/bookings/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/bookings/serializers')
const { FETCH_LIST_SCHEMA } = require('../../../../../models/v1/bookings/schema')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../models/v1/bookings/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/bookings', () => {
  it('should display all resources', async () => {
    const accountId = 'accountId'
    const perPage = 1
    const currentPage = 25
    const startDate = '2021-01-01'
    const endDate = '2021-01-01'
    const priceMin = '1000'
    const priceMax = '2000'
    const propertyIds = []
    const propertyUnitTypeIds = []
    const propertyUnitTypeUnitIds = []
    const statuses = []

    const data = 'data'
    const pagination = 'pagination'

    const cacheKey = 'cacheKey'
    const query = {}
    const response = {
      data: 'results',
      meta: { pagination },
    }

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)

    validate.mockResolvedValue({
      perPage,
      currentPage,
      startDate,
      endDate,
      priceMin,
      priceMax,
    })

    filterBookings.mockResolvedValue({ data, pagination })
    serialize.mockReturnValue('results')

    await expect(httpHandler({ user: { accountId }, query }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(query, { schema: FETCH_LIST_SCHEMA })
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.bookings.list.%s', accountId, {
      perPage,
      currentPage,
      propertyIds,
      propertyUnitTypeIds,
      propertyUnitTypeUnitIds,
      prices: '1000,2000',
      period: '2021-01-01,2021-01-01',
      statuses,
    })
    expect(filterBookings).toBeCalledWith({
      accountId,
      priceMin,
      priceMax,
      startDate,
      endDate,
      propertyIds,
      propertyUnitTypeIds,
      statuses,
    }, currentPage, perPage)
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data)
    expect(json).toBeCalledWith(response)
  })
})
