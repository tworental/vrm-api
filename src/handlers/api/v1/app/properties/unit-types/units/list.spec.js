const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitTypeBy } = require('../../../../../../../models/v1/unit-types/repositories')
const { selectBy: selectUnitsBy } = require('../../../../../../../models/v1/units/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../../models/v1/units/serializers')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../../models/v1/units/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/unit-types/:unitTypeId/units', () => {
  const accountId = 1
  const propertyId = 100
  const propertyUnitTypeId = 1000
  const units = ['unit']
  const data = 'data'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const json = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(accountId)
    selectOneUnitTypeBy.mockResolvedValue('unitType')
    selectUnitsBy.mockResolvedValue(units)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitsBy).toBeCalledWith({ propertyId, propertyUnitTypeId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, units)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when a property is not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitsBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when a unit type is not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitTypeBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
