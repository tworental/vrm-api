const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { upload } = require('../../../../../../services/s3')
const { mimeFromFile } = require('../../../../../../services/mime')
const { createTransaction } = require('../../../../../../services/database')
const { create: createFileBy } = require('../../../../../../models/v1/storage/files/repositories')
const { upsertOneBy: upsertFolderBy } = require('../../../../../../models/v1/storage/folders/repositories')
const { selectOneBy: selectProperty } = require('../../../../../../models/v1/properties/repositories')
const { selectOneBy: selectUnitType } = require('../../../../../../models/v1/unit-types/repositories')
const { selectOneBy: selectUnit } = require('../../../../../../models/v1/units/repositories')
const {
  create: createStorageImage,
  updateBy: updatePropertyImages,
  generateFilesPath,
} = require('../../../../../../models/v1/property-images/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/property-images/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../services/mime')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../../models/v1/storage/folders/repositories')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../models/v1/property-images/repositories')

const httpHandler = require('./create')

describe('POST v1/app/properties/images', () => {
  const body = 'body'
  const file = { data: 'data' }
  const propertyId = 'propertyId'
  const userId = 'userId'
  const accountId = 'accountId'
  const payload = {
    main: 1,
    propertyUnitTypeId: 'propertyUnitTypeId',
    propertyUnitTypeUnitId: 'propertyUnitTypeUnitId',
  }
  const propertiesFolder = {
    id: 1,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create an resource', async () => {
    const s3key = 's3Key'
    const publicUrl = 'publicUrl'
    const buffer = 'data'
    const ext = 'ext'
    const mime = 'mime'
    const storageFileId = 'storageFileId'
    const id = 'id'
    const trx = 'trx'

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation((args) => args)
    const curryGenerateFilesPath = jest.fn().mockReturnValue(s3key)

    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue('property')
    selectUnitType.mockResolvedValue('unitType')
    selectUnit.mockResolvedValue('unit')
    generateFilesPath.mockReturnValue(curryGenerateFilesPath)
    mimeFromFile.mockResolvedValue({ ext, mime })
    upload.mockResolvedValue({ Location: publicUrl })
    createFileBy.mockResolvedValue(storageFileId)
    upsertFolderBy.mockResolvedValue(propertiesFolder)
    updatePropertyImages.mockResolvedValue()
    createStorageImage.mockResolvedValue(id)

    await expect(httpHandler({
      body,
      files: { file },
      params: { propertyId },
      user: { id: userId, accountId },
    }, { status })).resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith({ ...body, propertyId }, { schema: CREATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ accountId, id: propertyId })
    expect(selectUnitType).toBeCalledWith({ propertyId, id: payload.propertyUnitTypeId })
    expect(selectUnit).toBeCalledWith({ propertyId, id: payload.propertyUnitTypeUnitId })
    expect(generateFilesPath).toBeCalledWith(file)
    expect(upsertFolderBy).toBeCalledWith({ accountId, name: 'properties', hidden: 1 })
    expect(curryGenerateFilesPath).toBeCalledWith(accountId, propertyId)
    expect(bufferFrom).toBeCalledWith(file.data, 'binary')
    expect(mimeFromFile).toBeCalledWith(file)
    expect(upload).toBeCalledWith(s3key, buffer, {
      ContentType: mime,
      ACL: 'public-read',
      Metadata: {
        'alt-name': encodeURIComponent(file.name),
      },
    })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createFileBy).toBeCalledWith({
      accountId,
      userId,
      ext,
      originalFileName: file.name,
      path: s3key,
      publicUrl,
      mimeType: mime,
      size: file.size,
      folderId: propertiesFolder.id,
    }, trx)
    expect(updatePropertyImages).toBeCalledWith({ propertyId }, { main: 0 }, trx)
    expect(createStorageImage).toBeCalledWith({
      storageFileId, ...payload,
    }, trx)
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error when image does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)

    await expect(httpHandler({
      body,
      files: { file: null },
      params: { propertyId },
      user: { id: userId, accountId },
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith({ ...body, propertyId }, { schema: CREATE_SCHEMA })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { image: ['required'] },
    })
  })

  it('should throw an error when property does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({
      body,
      files: { file },
      params: { propertyId },
      user: { id: userId, accountId },
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith({ ...body, propertyId }, { schema: CREATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ accountId, id: propertyId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { propertyId: ['notExists'] },
    })
  })

  it('should throw an error when unit type does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue('property')
    selectUnitType.mockResolvedValue(null)

    await expect(httpHandler({
      body,
      files: { file },
      params: { propertyId },
      user: { id: userId, accountId },
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith({ ...body, propertyId }, { schema: CREATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ accountId, id: propertyId })
    expect(selectUnitType).toBeCalledWith({ propertyId, id: payload.propertyUnitTypeId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { propertyUnitTypeId: ['notExists'] },
    })
  })

  it('should throw an error when unit does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectProperty.mockResolvedValue('property')
    selectUnitType.mockResolvedValue('unitType')
    selectUnit.mockResolvedValue(null)

    await expect(httpHandler({
      body,
      files: { file },
      params: { propertyId },
      user: { id: userId, accountId },
    })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith({ ...body, propertyId }, { schema: CREATE_SCHEMA })
    expect(selectProperty).toBeCalledWith({ accountId, id: propertyId })
    expect(selectUnitType).toBeCalledWith({ propertyId, id: payload.propertyUnitTypeId })
    expect(selectUnit).toBeCalledWith({ propertyId, id: payload.propertyUnitTypeUnitId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { propertyUnitTypeUnitId: ['notExists'] },
    })
  })
})
