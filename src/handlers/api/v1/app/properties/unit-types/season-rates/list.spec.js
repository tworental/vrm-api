const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { selectBy } = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  PERMITED_COLLECTION_PARAMS, serialize,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/serializers')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/serializers')

const httpHandler = require('./list')

describe('GET v1/app/properties/unit-types/season-rates', () => {
  const accountId = 'accountId'
  const propertyUnitTypeId = 'propertyUnitTypeId'

  const time = 1479427200000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = 'data'
    const seasonRates = { data }

    const json = jest.fn().mockImplementation((args) => args)

    const orderBy = jest.fn().mockResolvedValue(seasonRates)
    const orWhereNull = jest.fn()
    const where = jest.fn().mockReturnValue({ orWhereNull })

    const andWhere = jest.fn().mockImplementation((fn) => {
      fn({ where })
      return { orderBy }
    })

    selectBy.mockReturnValue({ andWhere })
    serialize.mockReturnValue(data)

    await expect(httpHandler({
      user: { accountId },
      params: { propertyUnitTypeId },
      query: { filter: 'active' },
    }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ propertyUnitTypeId, accountId })
    expect(andWhere).toBeCalledWith(expect.any(Function))
    expect(where).toBeCalledWith('end_date', '>=', new Date(time))
    expect(orWhereNull).not.toBeCalled()
    expect(orderBy).toBeCalledWith([
      { column: 'start_date', order: 'asc' },
      { column: 'end_date', order: 'desc' },
      { column: 'id', order: 'desc' },
    ])
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, seasonRates)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when season rate does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const orderBy = jest.fn().mockResolvedValue(null)
    const orWhereNull = jest.fn()
    const where = jest.fn().mockReturnValue({ orWhereNull })

    const andWhere = jest.fn().mockImplementation((fn) => {
      fn({ where })
      return { orderBy }
    })

    selectBy.mockReturnValue({ andWhere })

    await expect(httpHandler({
      user: { accountId },
      params: { propertyUnitTypeId },
      query: { filter: 'expired' },
    })).rejects.toThrow(errorMessage)

    expect(selectBy).toBeCalledWith({ propertyUnitTypeId, accountId })
    expect(selectBy).toBeCalledWith({ propertyUnitTypeId, accountId })
    expect(andWhere).toBeCalledWith(expect.any(Function))
    expect(where).toBeCalledWith('end_date', '<', new Date(time))
    expect(orWhereNull).toBeCalledWith('end_date')
    expect(orderBy).toBeCalledWith([
      { column: 'start_date', order: 'asc' },
      { column: 'end_date', order: 'desc' },
      { column: 'id', order: 'desc' },
    ])
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
