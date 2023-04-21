const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitTypeBy } = require('../../../../../../models/v1/unit-types/repositories')
const { selectBy: selectAmenitiesBy } = require('../../../../../../models/v1/unit-type-amenities/repositories')
const { selectBy: selectArrangementsBy } = require('../../../../../../models/v1/unit-type-arrangements/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/unit-types/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/unit-type-amenities/repositories')
jest.mock('../../../../../../models/v1/unit-type-arrangements/repositories')
jest.mock('../../../../../../models/v1/unit-types/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/properties/:propertyId/unit-types/:id', () => {
  const accountId = 1
  const propertyId = 100
  const id = 1000

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const unitType = 'data'
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
    selectOneUnitTypeBy.mockResolvedValue(unitType)
    selectArrangementsBy.mockResolvedValue(arrangements)
    selectAmenitiesBy.mockResolvedValue(amenities)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id, propertyId })
    expect(selectArrangementsBy).toBeCalledWith({ propertyUnitTypeId: id })
    expect(selectAmenitiesBy).toBeCalledWith({ propertyUnitTypeId: id })
    expect(serialize).toBeCalledWith(
      PERMITED_ITEM_PARAMS,
      unitType,
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

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when unit type does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitTypeBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
