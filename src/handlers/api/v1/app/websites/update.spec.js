const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { mimeFromFile } = require('../../../../../services/mime')
const { upload, deleteFiles } = require('../../../../../services/s3')
const {
  updateBy: updateWebsiteBy,
  selectOneBy: selectWebsiteBy,
  generateFilesPath,
} = require('../../../../../models/v1/websites/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/websites/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/websites/repositories')
jest.mock('../../../../../services/mime')
jest.mock('../../../../../services/s3')

const httpHandler = require('./update')

describe('PATCH /v1/app/websites/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'
  const faviconUrl = 'faviconUrl'
  const results = { id, faviconUrl }

  const files = {
    favicon: {
      name: 'name',
      data: 'data',
      size: 'size',
      mimetype: 'image/jpeg',
    },
  }

  const payload = {
    name: 'My website name',
    description: 'My website description',
    active: true,
  }

  const req = {
    files,
    user: { accountId },
    params: { id },
    body,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200
    const s3Key = 's3key'
    const mime = 'mime'
    const buffer = 'buffer'
    const acl = 'public-read'

    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation(() => buffer)
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue()
    const curryGenerateFilesPath = jest.fn().mockReturnValue(s3Key)

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValueOnce(results)
    selectWebsiteBy.mockReturnValueOnce({ where })
    generateFilesPath.mockReturnValue(curryGenerateFilesPath)
    mimeFromFile.mockResolvedValue({ ext: 'ext', mime })
    selectWebsiteBy.mockReturnValueOnce({ where })
    deleteFiles.mockResolvedValue()
    upload.mockResolvedValue({ Location: faviconUrl })
    updateWebsiteBy.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectWebsiteBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectWebsiteBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(generateFilesPath).toBeCalledWith(files.favicon)
    expect(curryGenerateFilesPath).toBeCalledWith(accountId, id)
    expect(bufferFrom).toBeCalledWith(files.favicon.data, 'binary')
    expect(mimeFromFile).toBeCalledWith(files.favicon)
    expect(deleteFiles).toBeCalledWith([faviconUrl])
    expect(upload).toBeCalledWith(s3Key, buffer, {
      ContentType: mime,
      ACL: acl,
      Metadata: {
        'alt-name': encodeURIComponent(files.favicon.name),
      },
    })
    expect(updateWebsiteBy).toBeCalledWith({ id: results.id }, { ...payload, faviconUrl })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when resource with the same name already exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue('differentWebsite')

    selectWebsiteBy.mockResolvedValueOnce(results)
    selectWebsiteBy.mockReturnValueOnce({ where })
    validate.mockResolvedValue(payload)

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(selectWebsiteBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectWebsiteBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(updateWebsiteBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { name: ['unique'] },
    })
  })

  it('should throw an error when resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({})
    selectWebsiteBy.mockResolvedValue(null)

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
