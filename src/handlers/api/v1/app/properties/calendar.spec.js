const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const {
  withProperty,
  withUnitType,
  selectBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/units/repositories')

const httpHandler = require('./calendar')

describe('GET /v1/app/properties/calendar', () => {
  const cacheKey = 'cacheKey'

  const user = { id: 1, accountId: 1000 }
  const query = { perPage: 10, currentPage: 1 }

  let json

  beforeEach(() => {
    json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return an empty properties list', async () => {
    const data = []
    const pagination = {}

    const response = { data, meta: { pagination } }

    const paginate = jest.fn().mockResolvedValue({ data, pagination })

    const select = jest.fn().mockReturnValue({ paginate })

    const whereNull = jest.fn()
    const whereProperties = jest.fn().mockReturnValue({ whereNull })
    const whereUnits = jest.fn().mockReturnValue({ where: whereProperties })
    const whereUnitTypes = jest.fn().mockReturnValue({ where: whereUnits })

    const andWhere = jest.fn().mockImplementation((fn) => {
      fn({ where: whereUnitTypes })
      return { select }
    })

    withUnitType.mockReturnValue('unitTypes')
    selectUnitsBy.mockReturnValue('units')

    withProperty.mockReturnValue({ andWhere })

    await expect(httpHandler({ user, query: {} }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.properties.calendar.%s', user.accountId, query)
    expect(withProperty).toBeCalledWith('unitTypes')
    expect(withUnitType).toBeCalledWith('units')
    expect(selectUnitsBy).toBeCalledWith({ accountId: user.accountId })
    expect(andWhere).toBeCalledWith(expect.any(Function))
    expect(whereUnitTypes).toBeCalledWith('property_unit_types.is_completed', '=', 1)
    expect(whereUnits).toBeCalledWith('property_unit_type_units.is_completed', '=', 1)
    expect(whereProperties).toBeCalledWith('properties.is_completed', '=', 1)
    expect(whereNull).toBeCalledWith('properties.deleted_at')
    expect(paginate).toBeCalledWith(query)
    expect(json).toBeCalledWith(response)
  })

  it('should return properties list', async () => {
    const response = {
      data: [
        {
          id: 1,
          name: 'Raddison Blu - Berlin',
          multipleUnitTypes: 0,
          checkinTime: '14:00',
          checkoutTime: '11:00',
          deletedAt: null,
          unitTypes: [
            {
              id: 1,
              name: 'Double room',
              units: [
                {
                  id: 1,
                  name: 'Room 200',
                  color: '#84E3DC',
                  status: 'ready',
                },
              ],
            },
          ],
        },
      ],
      meta: {
        pagination: {
          total: 1,
          lastPage: 1,
          perPage: 10,
          currentPage: 1,
          from: 0,
          to: 1,
        },
      },
    }

    const paginate = jest.fn().mockResolvedValue({
      data: [{
        id: 1,
        propertyId: 1,
        propertyUnitTypeId: 1,
        ownerId: null,
        name: 'Room 200',
        status: 'ready',
        priority: 'low',
        isActive: 1,
        isCompleted: 1,
        floor: null,
        area: 50,
        checkinTime: '14:00',
        checkoutTime: '11:00',
        areaUnit: 'sqm',
        color: '#84E3DC',
        outOfService: null,
        createdAt: '2021-04-15T10:20:52.000Z',
        updatedAt: '2021-04-15T10:21:54.000Z',
        deletedAt: null,
        propertyUnitTypeName: 'Double room',
        accountId: 1,
        multipleUnitTypes: 0,
        propertyName: 'Raddison Blu - Berlin',
      }],
      pagination: response.meta.pagination,
    })

    const select = jest.fn().mockReturnValue({ paginate })

    withUnitType.mockReturnValue('unitTypes')
    selectUnitsBy.mockReturnValue('units')

    const whereNull = jest.fn()
    const whereProperties = jest.fn().mockReturnValue({ whereNull })
    const whereUnits = jest.fn().mockReturnValue({ where: whereProperties })
    const whereUnitTypes = jest.fn().mockReturnValue({ where: whereUnits })

    const andWhere = jest.fn().mockImplementation((fn) => {
      fn({ where: whereUnitTypes })
      return { select }
    })

    withProperty.mockReturnValue({ andWhere })

    await expect(httpHandler({ user, query }, { json }))
      .resolves.toEqual(response)

    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.properties.calendar.%s', user.accountId, query)
    expect(withProperty).toBeCalledWith('unitTypes')
    expect(withUnitType).toBeCalledWith('units')
    expect(selectUnitsBy).toBeCalledWith({ accountId: user.accountId })
    expect(andWhere).toBeCalledWith(expect.any(Function))
    expect(whereUnitTypes).toBeCalledWith('property_unit_types.is_completed', '=', 1)
    expect(whereUnits).toBeCalledWith('property_unit_type_units.is_completed', '=', 1)
    expect(whereProperties).toBeCalledWith('properties.is_completed', '=', 1)
    expect(whereNull).toBeCalledWith('properties.deleted_at')
    expect(paginate).toBeCalledWith(query)
    expect(json).toBeCalledWith(response)
  })
})
