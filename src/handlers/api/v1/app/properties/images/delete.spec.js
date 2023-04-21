const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { deleteFiles } = require('../../../../../../services/s3')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
  deleteBy: deletePropertyImage,
  shiftImagePositions,
} = require('../../../../../../models/v1/property-images/repositories')
const {
  selectOneBy: selectStorageFile,
  deleteBy: deleteStorageFile,
} = require('../../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-images/repositories')
jest.mock('../../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./delete')

describe('DELETE v1/app/properties/images', () => {
  const accountId = 'accountId'
  const id = 'id'
  const propertyId = 'propertyId'
  const trx = 'transaction'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete an resource', async () => {
    const status = 204
    const propertyImage = {
      storageFileId: 'storageFileId',
      position: 1,
      propertyUnitTypeId: 'unit-type',
      propertyUnitTypeUnitId: 'unit',
    }
    const storageFile = { path: 'path' }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    selectProperty.mockResolvedValue('property')
    selectPropertyImage.mockResolvedValue(propertyImage)
    selectStorageFile.mockResolvedValue(storageFile)
    deleteStorageFile.mockResolvedValue()
    deleteFiles.mockResolvedValue()
    deletePropertyImage.mockResolvedValue()
    shiftImagePositions.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { id, propertyId } }, { sendStatus }))
      .resolves.toBe(status)

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(selectStorageFile).toBeCalledWith({ id: propertyImage.storageFileId, accountId }, trx)
    expect(deleteStorageFile).toBeCalledWith({ id: propertyImage.storageFileId, accountId }, trx)
    expect(deleteFiles).toBeCalledWith([storageFile.path])
    expect(deletePropertyImage).toBeCalledWith({ id, propertyId }, trx)
    expect(shiftImagePositions).toBeCalledWith(
      2,
      propertyId,
      'unit-type',
      'unit',
      trx,
    )
    expect(sendStatus).toBeCalledWith(status)
  })

  it('should throw an error when property does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id, propertyId } })).rejects.toThrow(errorMessage)

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

    selectProperty.mockResolvedValue('property')
    selectPropertyImage.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id, propertyId } })).rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyImage).toBeCalledWith({ id, propertyId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
