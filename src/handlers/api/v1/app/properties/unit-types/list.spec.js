const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const { selectBy: selectUnitTypesBy } = require('../../../../../../models/v1/unit-types/repositories')
const { selectBy: selectUnitsBy } = require('../../../../../../models/v1/units/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/unit-types/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../models/v1/unit-types/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/unit-types', () => {
  const accountId = 1
  const propertyId = 1000
  const data = 'data'
  const response = { data: 'data' }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const unitTypes = [{ id: 1 }, { id: 2 }]
    const units = [{ propertyUnitTypeId: 1 }]

    const json = jest.fn().mockImplementation((args) => args)
    const whereIn = jest.fn().mockResolvedValue(units)

    selectPropertyBy.mockResolvedValue(accountId)
    selectUnitTypesBy.mockResolvedValue(unitTypes)
    selectUnitsBy.mockReturnValue({ whereIn })
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { propertyId } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitTypesBy).toBeCalledWith({ propertyId })
    expect(selectUnitsBy).toBeCalledWith({ propertyId })
    expect(whereIn).toBeCalledWith('propertyUnitTypeId', [1, 2])
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, [
      { ...unitTypes[0], unitsNo: 1 },
      { ...unitTypes[1], unitsNo: 0 },
    ])
    expect(json).toBeCalledWith(response)
  })

  it('should throw an error when property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitTypesBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
