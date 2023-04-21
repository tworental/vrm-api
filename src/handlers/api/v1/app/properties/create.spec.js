const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
  create: createProperty,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitType,
  create: createUnitType,
} = require('../../../../../models/v1/unit-types/repositories')
const { create: createUnitTypeRate } = require('../../../../../models/v1/unit-type-rates/repositories')
const { create: createUnitTypeRatePrice } = require('../../../../../models/v1/unit-type-rate-prices/repositories')
const { create: createUnit } = require('../../../../../models/v1/units/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/properties/serializers')
const { CREATE_SCHEMA } = require('../../../../../models/v1/properties/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../models/v1/unit-type-rates/repositories')
jest.mock('../../../../../models/v1/unit-type-rate-prices/repositories')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/properties/serializers')

const httpHandler = require('./create')

describe('POST /v1/app/properties', () => {
  it('should create a resource', async () => {
    const trx = 'trx'
    const accountId = 'accountId'
    const propertyId = 'propertyId'
    const propertyUnitTypeId = 'propertyUnitTypeId'
    const propertyUnitTypeRateId = 'propertyUnitTypeRateId'
    const totalGuests = 1

    const body = {
      name: 'Property Name',
      multipleUnitTypes: 1,
    }

    const property = {
      id: propertyId,
      name: body.name,
    }

    const req = {
      body,
      account: {
        id: accountId,
        settings: { language: 'en' },
      },
    }

    const json = jest.fn().mockImplementation((args) => args)

    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue(body)
    createProperty.mockResolvedValue(propertyId)
    createUnitType.mockResolvedValue(propertyUnitTypeId)
    createUnitTypeRate.mockResolvedValue(propertyUnitTypeRateId)
    selectUnitType.mockResolvedValue({ totalGuests })
    createUnitTypeRatePrice.mockResolvedValue()
    createUnit.mockResolvedValue()
    selectPropertyBy.mockResolvedValue('propertyData')
    serialize.mockReturnValue(property)

    await expect(httpHandler(req, { json })).resolves.toEqual({ data: property })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createProperty).toBeCalledWith({
      accountId: req.account.id,
      name: body.name,
      multipleUnitTypes: body.multipleUnitTypes,
      languages: [req.account.settings.language],
    }, trx)
    expect(createUnitType).toBeCalledWith({
      propertyId,
      name: 'Default Rental Type',
    }, trx)
    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId }, trx)
    expect(createUnitTypeRate).toBeCalledWith({
      accountId,
      propertyId,
      propertyUnitTypeId,
      name: 'Default Rate',
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
      name: 'Default Room',
      color: '#84E3DC',
    }, trx)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, 'propertyData')
    expect(json).toBeCalledWith({ data: property })
  })
})
