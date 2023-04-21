const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy } = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  selectBy: selectUnitTypeRateSeasonPrices,
} = require('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  PERMITED_ITEM_PARAMS, serialize,
} = require('../../../../../../../models/v1/unit-type-rate-seasons/serializers')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-season-prices/repositories')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/serializers')

const httpHandler = require('./show')

describe('GET v1/app/properties/unit-types/season-rates', () => {
  const accountId = 'accountId'
  const id = 'id'

  it('should display a resource', async () => {
    const data = 'data'
    const seasonRate = { id }
    const pricesNightly = { data }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(seasonRate)
    selectUnitTypeRateSeasonPrices.mockResolvedValue(pricesNightly)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(selectUnitTypeRateSeasonPrices).toBeCalledWith({
      accountId,
      propertyUnitTypeRateSeasonId: seasonRate.id,
    })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, seasonRate, {
      pricesNightly,
    })
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when season rate does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id } })).rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
