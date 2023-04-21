const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitBy } = require('../../../../../../../models/v1/units/repositories')
const { selectBy: selectAmenitiesBy } = require('../../../../../../../models/v1/unit-amenities/repositories')
const { selectBy: selectArrangementsBy } = require('../../../../../../../models/v1/unit-arrangements/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../../models/v1/units/serializers')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../../models/v1/unit-amenities/repositories')
jest.mock('../../../../../../../models/v1/unit-arrangements/repositories')
jest.mock('../../../../../../../models/v1/units/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/properties/:propertyId/unit-types/:propertyunitTypeId/units/:id', () => {
  const accountId = 1
  const propertyId = 100
  const propertyUnitTypeId = 1000
  const id = 1000

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const unit = 'data'
    const data = { key: 'results' }

    const amenities = [
      { id: 1, dictAmenityId: 101, count: 5 },
    ]

    const arrangements = [
      {
        id: 1, dictArrangementId: 100, count: 55, privacy: 'private', type: 'sleeping',
      },
    ]

    const json = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitBy.mockResolvedValue(unit)
    selectArrangementsBy.mockResolvedValue(arrangements)
    selectAmenitiesBy.mockResolvedValue(amenities)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(selectArrangementsBy).toBeCalledWith({ propertyUnitTypeUnitId: id })
    expect(selectAmenitiesBy).toBeCalledWith({ propertyUnitTypeUnitId: id })
    expect(serialize).toBeCalledWith(
      PERMITED_ITEM_PARAMS,
      unit,
      {
        arrangements: [{
          dictArrangementId: 100, count: 55, privacy: 'private', type: 'sleeping',
        }],
        amenities: [{
          dictAmenityId: 101, count: 5,
        }],
      },
    )
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when an unit type does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
