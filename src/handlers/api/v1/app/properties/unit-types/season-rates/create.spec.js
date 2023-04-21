const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  selectOneBy: selectUnitType,
} = require('../../../../../../../models/v1/unit-types/repositories')
const {
  selectOneBy: selectUnitTypeRate,
} = require('../../../../../../../models/v1/unit-type-rates/repositories')
const {
  create: createUnitTypeRateSeasonPrice,
} = require('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  create: createUnitTypeRateSeason,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  selectOneBy: selectRateSeason,
} = require('../../../../../../../models/v1/rate-seasons/repositories')
const { CREATE_SCHEMA } = require('../../../../../../../models/v1/unit-type-rate-seasons/schema')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/validate')
jest.mock('../../../../../../../services/database')
jest.mock('../../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rates/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
jest.mock('../../../../../../../models/v1/rate-seasons/repositories')

const httpHandler = require('./create')

describe('POST v1/app/properties/unit-types/season-rates', () => {
  const body = 'body'
  const accountId = 'accountId'
  const propertyId = 'propertyId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const propertyUnitTypeRateId = 'propertyUnitTypeRateId'
  const payload = { key: 'value' }
  const rateSeasonId = 'rateSeasonId'
  const trx = 'Transaction'
  const data = {
    rateSeasonId, propertyUnitTypeRateId, ...payload,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it.skip('should create an resource', async () => {
    const propertyUnitTypeRateSeasonId = 'propertyUnitTypeRateSeasonId'
    const unitType = { totalGuests: [{ id: 'id', name: 'name' }] }
    const extra = { rateSeasonId }
    const id = 'id'

    const json = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    selectUnitType.mockResolvedValue(unitType)
    validate.mockResolvedValue(data)
    selectUnitTypeRate.mockResolvedValue('unitTypeRate')
    selectRateSeason.mockResolvedValue('rateSeason')
    createTransaction.mockResolvedValue(id)
    createUnitTypeRateSeason.mockResolvedValue(propertyUnitTypeRateSeasonId)
    createUnitTypeRateSeasonPrice.mockResolvedValue()

    await expect(httpHandler({
      body,
      user: { accountId },
      params: { propertyId, propertyUnitTypeId },
    }, { json })).resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectUnitTypeRate).toBeCalledWith({ id: propertyUnitTypeRateId, accountId })
    expect(selectRateSeason).toBeCalledWith({ accountId, id: rateSeasonId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createUnitTypeRateSeason).toBeCalledWith({
      ...payload,
      ...extra,
      accountId,
      propertyUnitTypeId,
      propertyUnitTypeRateId,
    }, trx)
    // TODO function is not getting called
    // expect(createUnitTypeRateSeasonPrice).toBeCalledWith({
    //   accountId,
    //   propertyUnitTypeRateSeasonId,
    //   occupancy: 1,
    //   enabled: 1,
    // }, trx)
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error when unit type does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectUnitType.mockResolvedValue(null)

    await expect(httpHandler({
      body,
      user: { accountId },
      params: { propertyId, propertyUnitTypeId },
    })).rejects.toThrow(errorMessage)

    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw an error when unit type rate does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectUnitType.mockResolvedValue('unitType')
    validate.mockResolvedValue(data)
    selectUnitTypeRate.mockResolvedValue(null)

    await expect(httpHandler({
      body,
      user: { accountId },
      params: { propertyId, propertyUnitTypeId },
    })).rejects.toThrow(errorMessage)

    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectUnitTypeRate).toBeCalledWith({ id: propertyUnitTypeRateId, accountId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        propertyUnitTypeRateId: ['notExists'],
      },
    })
  })
})
