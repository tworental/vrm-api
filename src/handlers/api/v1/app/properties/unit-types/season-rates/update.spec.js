const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  selectOneBy: selectUnitType,
} = require('../../../../../../../models/v1/unit-types/repositories')
const {
  selectOneBy: selectUnitTypeRateSeason,
  updateBy: updateUnitTypeRateSeason,
  isCompleted,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  updateBy: updateUnitTypeRateSeasonPrice,
  selectBy: updateUnitTypeRateSeasonPrices,
} = require('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  selectOneBy: selectRateSeason,
} = require('../../../../../../../models/v1/rate-seasons/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../../models/v1/unit-type-rate-seasons/schema')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/validate')
jest.mock('../../../../../../../services/database')
jest.mock('../../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
jest.mock('../../../../../../../models/v1/rate-seasons/repositories')

const httpHandler = require('./update')

describe('PATCH v1/app/properties/unit-types/season-rates', () => {
  const accountId = 'accountId'
  const id = 'id'
  const propertyId = 'propertyId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const body = 'body'
  const trx = 'Transaction'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update an resource', async () => {
    const status = 204
    const unitTypeRateSeason = { id: 'id' }
    const rateSeasonId = 'rateSeasonId'
    const extra = { rateSeasonId }
    const payload = { key: 'value' }
    const data = { pricesNightly: [{ id: 'id', name: 'name', rate: 'rate' }], rateSeasonId, ...payload }
    const unitTypeRatePrices = [{ id: 'id' }]

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    selectUnitType.mockResolvedValue('unitType')
    selectUnitTypeRateSeason.mockResolvedValue(unitTypeRateSeason)
    validate.mockResolvedValue(data)
    selectRateSeason.mockResolvedValue('rateSeason')
    updateUnitTypeRateSeasonPrices.mockResolvedValue(unitTypeRatePrices)
    updateUnitTypeRateSeason.mockResolvedValue()
    updateUnitTypeRateSeasonPrice.mockResolvedValue()
    isCompleted.mockReturnValue(true)

    await expect(httpHandler({
      body, user: { accountId }, params: { id, propertyId, propertyUnitTypeId },
    }, { sendStatus })).resolves.toEqual(status)

    expect(handler).toBeCalled()
    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(selectUnitTypeRateSeason).toBeCalledWith({ id, accountId, propertyUnitTypeId })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectRateSeason).toBeCalledWith({ accountId, id: rateSeasonId })
    expect(updateUnitTypeRateSeasonPrices).toBeCalledWith({
      accountId, propertyUnitTypeRateSeasonId: unitTypeRateSeason.id,
    })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateUnitTypeRateSeason).toBeCalledWith({ id: unitTypeRateSeason.id }, {
      ...payload,
      ...extra,
      accountId,
      propertyUnitTypeId,
      isCompleted: true,
    }, trx)
    expect(isCompleted).toBeCalledWith({
      ...unitTypeRateSeason,
      ...payload,
      accomodations: [{ id: 'id', name: 'name', rate: 'rate' }],
    })
    expect(updateUnitTypeRateSeasonPrice).toBeCalledWith({ id, accountId }, { name: 'name', rate: 'rate' }, trx)
    expect(sendStatus).toBeCalledWith(status)
  })

  it('should throw an error when unit type does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectUnitType.mockResolvedValue(null)

    await expect(httpHandler({
      body, user: { accountId }, params: { id, propertyId, propertyUnitTypeId },
    })).rejects.toThrow(errorMessage)

    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw an error when unit type rate season does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectUnitType.mockResolvedValue('unitType')
    selectUnitTypeRateSeason.mockResolvedValue(null)

    await expect(httpHandler({
      body, user: { accountId }, params: { id, propertyId, propertyUnitTypeId },
    })).rejects.toThrow(errorMessage)

    expect(selectUnitType).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(selectUnitTypeRateSeason).toBeCalledWith({ id, accountId, propertyUnitTypeId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
