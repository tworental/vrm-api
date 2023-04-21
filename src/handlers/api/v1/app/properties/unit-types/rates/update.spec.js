const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  updateCompletenessStatus,
} = require('../../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitType,
} = require('../../../../../../../models/v1/unit-types/repositories')
const {
  selectOneBy: selectUnitTypeRate,
  updateBy: updateUnitTypeRate,
} = require('../../../../../../../models/v1/unit-type-rates/repositories')
const {
  updateBy: updateUnitTypeRatePrice,
  selectBy: selectUnitTypeRatePrices,
} = require('../../../../../../../models/v1/unit-type-rate-prices/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../../models/v1/unit-type-rates/schema')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/validate')
jest.mock('../../../../../../../services/database')
jest.mock('../../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rates/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-prices/repositories')

const httpHandler = require('./update')

describe('PATCH v1/app/properties/unit-types/rates', () => {
  const body = 'body'
  const accountId = 'accountId'
  const propertyId = 'propertyId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const trx = 'Transaction'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update an resource', async () => {
    const status = 204
    const payload = { key: 'value' }
    const data = { pricesNightly: [{ id: 'id', priceNightly: 'price' }], ...payload }
    const unitTypeRate = { id: 'id' }
    const unitTypeRatePrices = [{ id: 'id' }]

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    selectUnitType.mockResolvedValue('unitType')
    selectUnitTypeRate.mockResolvedValue(unitTypeRate)
    validate.mockResolvedValue(data)
    selectUnitTypeRatePrices.mockResolvedValue(unitTypeRatePrices)
    updateUnitTypeRate.mockResolvedValue()
    updateUnitTypeRatePrice.mockResolvedValue()
    updateCompletenessStatus.mockResolvedValue()

    await expect(httpHandler({ body, user: { accountId }, params: { propertyId, propertyUnitTypeId } },
      { sendStatus })).resolves.toEqual(status)

    expect(handler).toBeCalled()
    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(selectUnitTypeRate).toBeCalledWith({ propertyId, propertyUnitTypeId, accountId })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectUnitTypeRatePrices).toBeCalledWith({
      accountId, propertyUnitTypeRateId: unitTypeRate.id,
    })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateUnitTypeRate).toBeCalledWith({ id: unitTypeRate.id }, {
      ...payload,
      accountId,
      propertyUnitTypeId,
    }, trx)
    expect(updateUnitTypeRatePrice).toBeCalledWith(
      { id: 'id', accountId },
      { priceNightly: 'price', occupancy: 1 },
      trx,
    )
    expect(updateCompletenessStatus).toBeCalledWith(propertyId)
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
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectUnitType.mockResolvedValue('unitType')
    selectUnitTypeRate.mockResolvedValue(null)

    await expect(httpHandler({
      body,
      user: { accountId },
      params: { propertyId, propertyUnitTypeId },
    })).rejects.toThrow(errorMessage)

    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(selectUnitTypeRate).toBeCalledWith({ propertyId, propertyUnitTypeId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
