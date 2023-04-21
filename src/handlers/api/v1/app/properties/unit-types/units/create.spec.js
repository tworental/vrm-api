const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { selectOneBy: selectPropertyBy } = require('../../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectOneUnitTypeBy } = require('../../../../../../../models/v1/unit-types/repositories')
const { create: createUnit } = require('../../../../../../../models/v1/units/repositories')
const { CREATE_SCHEMA } = require('../../../../../../../models/v1/units/schema')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/validate')
jest.mock('../../../../../../../services/database')
jest.mock('../../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../../models/v1/units/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/properties/:propertyId/unit-types/:propertyUnitTypeId/units', () => {
  const body = 'body'
  const name = 'name'
  const accountId = 1
  const propertyId = 100
  const propertyUnitTypeId = 1000

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const id = 1

    const property = {
      id: propertyId,
    }

    const unitType = {
      id: propertyUnitTypeId,
      area: 100,
      areaUnit: 'sqm',
    }

    const json = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(property)
    selectOneUnitTypeBy.mockResolvedValue(unitType)
    validate.mockResolvedValue({ name })
    createUnit.mockResolvedValue(id)

    await expect(httpHandler({
      body, account: { id: accountId }, params: { propertyUnitTypeId, propertyId },
    }, { json })).resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createUnit).toBeCalledWith({
      area: unitType.area,
      areaUnit: unitType.areaUnit,
      name,
      propertyId,
      propertyUnitTypeId,
    })
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error when property does not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({
      body, account: { id: accountId }, params: { propertyId },
    })).rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).not.toBeCalled()
    expect(createUnit).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when an unit type does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue('property')
    selectOneUnitTypeBy.mockResolvedValue(null)

    await expect(httpHandler({
      body, account: { id: accountId }, params: { propertyUnitTypeId, propertyId },
    })).rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id: propertyUnitTypeId, propertyId })
    expect(createUnit).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
