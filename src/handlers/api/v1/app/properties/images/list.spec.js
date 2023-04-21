const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { storageFiles } = require('../../../../../../models/v1/property-images/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-images/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-images/repositories')
jest.mock('../../../../../../models/v1/property-images/serializers')

const httpHandler = require('./list')

describe('GET v1/app/properties/images', () => {
  const accountId = 'accountId'
  const propertyId = 'propertyId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const propertyUnitTypeUnitId = 'propertyUnitTypeUnitId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = 'data'
    const results = [{ uuid: 'uuid' }]

    const json = jest.fn().mockImplementation((args) => args)

    selectProperty.mockResolvedValue('property')
    storageFiles.mockResolvedValue(results)
    serialize.mockReturnValue(data)

    await expect(httpHandler({
      user: { accountId },
      params: { propertyId },
      query: { propertyUnitTypeId, propertyUnitTypeUnitId },
    }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(storageFiles).toBeCalledWith(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId)
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when property does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({
      user: { accountId },
      params: { propertyId },
      query: { propertyUnitTypeId, propertyUnitTypeUnitId },
    })).rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
