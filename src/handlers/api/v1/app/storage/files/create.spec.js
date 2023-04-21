const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { upload } = require('../../../../../../services/s3')
const { validate } = require('../../../../../../services/validate')
const { mimeFromFile } = require('../../../../../../services/mime')
const {
  create: createFileBy,
  selectOneBy: selectFileBy,
  generateFilesPath,
} = require('../../../../../../models/v1/storage/files/repositories')
const {
  selectOneBy: selectFolderBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/files/serializers')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/storage/files/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/mime')
jest.mock('../../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../../models/v1/storage/folders/repositories')
jest.mock('../../../../../../models/v1/storage/files/serializers')

const httpHandler = require('./create')

describe('POST /v1/app/storage/files', () => {
  const userId = 'userId'
  const accountId = 'accountId'
  const folderId = 'folderId'

  const body = { folderId }

  const files = {
    file: {
      name: 'name',
      data: 'data',
      size: 'size',
      mimetype: 'json',
    },
  }

  const req = {
    files,
    user: { id: userId, accountId },
    body,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should upload a resource', async () => {
    const path = 's3key'
    const mime = 'mime'
    const fileId = 'fileId'

    const data = {
      id: 'id',
      folderId,
      uuid: 'uuid',
      name: 'originalFileName',
      size: 'size',
      mimeType: 'mimeType',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }

    const buffer = 'buffer'

    const json = jest.fn().mockImplementation((args) => args)
    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation(() => buffer)
    const curryGenerateFilesPath = jest.fn().mockReturnValue(path)

    validate.mockResolvedValue({ folderId })
    selectFolderBy.mockResolvedValue(accountId)
    selectFileBy.mockResolvedValueOnce(null)
    generateFilesPath.mockReturnValue(curryGenerateFilesPath)
    mimeFromFile.mockResolvedValue({ ext: 'ext', mime })
    upload.mockResolvedValue()
    createFileBy.mockResolvedValue(fileId)
    selectFileBy.mockResolvedValueOnce(data)
    serialize.mockReturnValue(data)

    await expect(httpHandler(req, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectFolderBy).toBeCalledWith({ accountId, id: folderId })
    expect(generateFilesPath).toBeCalledWith(files.file)
    expect(curryGenerateFilesPath).toBeCalledWith(accountId)
    expect(selectFileBy).toBeCalledWith({ accountId, path })
    expect(bufferFrom).toBeCalledWith(files.file.data, 'binary')
    expect(mimeFromFile).toBeCalledWith(files.file)
    expect(upload).toBeCalledWith(path, buffer, {
      ContentType: mime,
      Metadata: {
        'alt-name': encodeURIComponent(files.file.name),
      },
    })
    expect(createFileBy).toBeCalledWith({
      accountId,
      userId,
      folderId,
      ext: 'ext',
      originalFileName: files.file.name,
      path,
      mimeType: mime,
      size: files.file.size,
    })
    expect(selectFileBy).toBeCalledWith({ id: fileId })
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.storage.*`)
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if no file is uploaded', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ ...req, files: {} })).rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { file: ['required'] },
    })
  })

  it('should throw an error if folder does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ folderId })
    selectFolderBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectFolderBy).toBeCalledWith({ accountId, id: folderId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { folderId: ['notExists'] },
    })
  })

  it('should throw an error if file already exists', async () => {
    const errorMessage = 'Already Exists'
    const path = 's3key'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const curryGenerateFilesPath = jest.fn().mockReturnValue(path)

    validate.mockResolvedValue({ folderId })
    selectFolderBy.mockResolvedValue(accountId)
    generateFilesPath.mockReturnValue(curryGenerateFilesPath)
    selectFileBy.mockResolvedValue(accountId)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectFolderBy).toBeCalledWith({ accountId, id: folderId })
    expect(generateFilesPath).toBeCalledWith(files.file)
    expect(curryGenerateFilesPath).toBeCalledWith(accountId)
    expect(selectFileBy).toBeCalledWith({ accountId, path })
    expect(createError).toBeCalledWith(409, errorMessage, {
      code: 'ALREADY_EXISTS',
    })
  })
})
