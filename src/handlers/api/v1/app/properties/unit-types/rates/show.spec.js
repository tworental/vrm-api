const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const {
  selectOneBy: selectUnitTypeRate,
} = require('../../../../../../../models/v1/unit-type-rates/repositories')
const {
  selectBy: selectUnitTypeRatePrices,
} = require('../../../../../../../models/v1/unit-type-rate-prices/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../../models/v1/unit-type-rates/serializers')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/unit-type-rates/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-prices/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rates/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/properties/unit-types/rates', () => {
  const accountId = 'accountId'
  const propertyUnitTypeId = 'propertyUnitTypeId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show an resource', async () => {
    const unitTypeRate = { id: 92, name: 'name', rate: 100 }
    const pricesNightly = 'pricesNightly'
    const data = ['prices']
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    selectUnitTypeRate.mockResolvedValue(unitTypeRate)
    selectUnitTypeRatePrices.mockResolvedValue(pricesNightly)
    serialize.mockReturnValue(response.data)

    await expect(httpHandler({ user: { accountId }, params: { propertyUnitTypeId } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectUnitTypeRate).toBeCalledWith({ propertyUnitTypeId, accountId })
    expect(selectUnitTypeRatePrices).toBeCalledWith({
      accountId,
      propertyUnitTypeRateId: unitTypeRate.id,
    })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, unitTypeRate, {
      pricesNightly,
    })
    expect(json).toBeCalledWith(response)
  })

  it('should throw an error when unit type rate does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectUnitTypeRate.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyUnitTypeId } }))
      .rejects.toThrow(errorMessage)
    expect(selectUnitTypeRate).toBeCalledWith({ propertyUnitTypeId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
    expect(selectUnitTypeRatePrices).not.toBeCalled()
  })
})
