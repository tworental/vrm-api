const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
  updateBy: updatePropertyImages,
  storageFiles,
} = require('../../../../../../models/v1/property-images/repositories')
const { MOVE_SCHEMA } = require('../../../../../../models/v1/property-images/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-images/repositories')

const httpHandler = require('./move')

describe('PATCH v1/app/properties/images/:id/move', () => {
  const accountId = 'accountId'
  const id = 'id'
  const propertyId = 'propertyId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const propertyUnitTypeUnitId = 'propertyUnitTypeUnitId'
  const trx = 'transaction'
  const newIndex = 2
  const oldIndex = 0
  const body = { newIndex, oldIndex }
  const query = { propertyUnitTypeId, propertyUnitTypeUnitId }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should move resource to the right', async () => {
    const status = 204
    const property = { id: 1 }

    validate.mockResolvedValue({ newIndex, oldIndex })
    selectProperty.mockResolvedValue(property)
    selectPropertyImage.mockResolvedValue(true)

    const whereBetween = jest.fn().mockResolvedValue([
      { id: 1, position: 1 },
      { id: 2, position: 2 },
    ])

    storageFiles.mockReturnValue({ whereBetween })

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({
      user: { accountId }, params: { id, propertyId }, body, query,
    }, { sendStatus }))
      .resolves.toBe(status)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: MOVE_SCHEMA })
    expect(sendStatus).toBeCalledWith(status)
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(storageFiles).toBeCalledWith(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId)
    expect(whereBetween).toBeCalledWith('position', [1, 2])
    expect(updatePropertyImages).toBeCalledWith({ id: 1, propertyId }, { position: 0 }, trx)
    expect(updatePropertyImages).toBeCalledWith({ id: 2, propertyId }, { position: 1 }, trx)
    expect(updatePropertyImages).toBeCalledWith({ id, propertyId }, { position: 2 }, trx)
  })

  it('should move resource to the left', async () => {
    const status = 204
    const property = { id: 1 }
    const newIndexLeft = 0
    const oldIndexLeft = 2
    const bodyLeft = { newIndex: newIndexLeft, oldIndex: oldIndexLeft }

    validate.mockResolvedValue({ newIndex: newIndexLeft, oldIndex: oldIndexLeft })
    selectProperty.mockResolvedValue(property)
    selectPropertyImage.mockResolvedValue(true)

    const whereBetween = jest.fn().mockResolvedValue([
      { id: 1, position: 0 },
      { id: 2, position: 1 },
      { id: 3, position: 2 },
    ])

    storageFiles.mockReturnValue({ whereBetween })

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({
      user: { accountId }, params: { id, propertyId }, body: bodyLeft, query,
    }, { sendStatus }))
      .resolves.toBe(status)

    expect(validate).toBeCalledWith(bodyLeft, { schema: MOVE_SCHEMA })
    expect(sendStatus).toBeCalledWith(status)
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(storageFiles).toBeCalledWith(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId)
    expect(whereBetween).toBeCalledWith('position', [0, 2])
    expect(updatePropertyImages).toBeCalledWith({ id: 1, propertyId }, { position: 1 }, trx)
    expect(updatePropertyImages).toBeCalledWith({ id: 2, propertyId }, { position: 2 }, trx)
    expect(updatePropertyImages).toBeCalledWith({ id: 3, propertyId }, { position: 3 }, trx)
    expect(updatePropertyImages).toBeCalledWith({ id, propertyId }, { position: 0 }, trx)
  })

  it('should throw an error when property does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ newIndex, oldIndex })
    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({
      user: { accountId }, params: { id, propertyId }, query, body,
    })).rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw an error when property image does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ newIndex, oldIndex })
    selectProperty.mockResolvedValue('property')
    selectPropertyImage.mockResolvedValue(null)

    await expect(httpHandler({
      user: { accountId }, params: { id, propertyId }, query, body,
    })).rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
