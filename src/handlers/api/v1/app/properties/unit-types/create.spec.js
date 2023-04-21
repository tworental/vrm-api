const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitType,
  create: createUnitType,
} = require('../../../../../../models/v1/unit-types/repositories')
const { create: createUnitTypeRate } = require('../../../../../../models/v1/unit-type-rates/repositories')
const { create: createUnitTypeRatePrice } = require('../../../../../../models/v1/unit-type-rate-prices/repositories')
const { create: createUnit } = require('../../../../../../models/v1/units/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/unit-types/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/unit-type-rates/repositories')
jest.mock('../../../../../../models/v1/unit-type-rate-prices/repositories')
jest.mock('../../../../../../models/v1/units/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/properties/:propertyId/unit-types', () => {
  const body = 'body'
  const trx = 'transaction'
  const totalGuests = 1
  const accountId = 'accountId'
  const propertyId = 'propertyId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const propertyUnitTypeRateId = 'propertyUnitTypeRateId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const unitsNo = 5

    const payload = {
      dictGuestTypeId: 'dictGuestTypeId',
      name: 'name',
      areaUnit: 'areaUnit',
      area: 'area',
      totalGuests: 1,
      privacy: 'privacy',
      color: 'color',
    }

    const json = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(propertyId)
    validate.mockResolvedValue({ ...payload, unitsNo })
    createTransaction.mockImplementation((fn) => fn(trx))
    createUnitType.mockResolvedValue(propertyUnitTypeId)
    createUnitTypeRate.mockResolvedValue(propertyUnitTypeRateId)
    createUnitTypeRatePrice.mockResolvedValue()
    selectUnitType.mockResolvedValue({
      totalGuests,
      area: payload.area,
      areaUnit: payload.areaUnit,
    })

    createUnit.mockResolvedValue()

    await expect(httpHandler({ body, account: { id: accountId }, params: { propertyId } }, { json }))
      .resolves.toEqual({ data: { id: propertyUnitTypeId } })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createUnitType).toBeCalledWith({
      propertyId, ...payload,
    }, trx)
    expect(createUnitTypeRate).toBeCalledWith({
      accountId,
      propertyId,
      propertyUnitTypeId,
      name: 'Default Rate',
    }, trx)
    expect(selectUnitType).toBeCalledWith({
      id: propertyUnitTypeId,
      propertyId,
    }, trx)
    expect(createUnitTypeRatePrice).toBeCalledWith({
      accountId,
      propertyUnitTypeRateId,
      occupancy: 1,
      enabled: 1,
    }, trx)
    expect(createUnit).toBeCalledWith({
      propertyId,
      propertyUnitTypeId,
      area: payload.area,
      areaUnit: payload.areaUnit,
      name: 'Unit 1',
      color: '#84E3DC',
    }, trx)
    expect(json).toBeCalledWith({ data: { id: propertyUnitTypeId } })
  })

  it('should throw an error if property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ body, account: { id: accountId }, params: { propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(createTransaction).not.toBeCalled()
    expect(createUnitType).not.toBeCalled()
    expect(createUnit).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
