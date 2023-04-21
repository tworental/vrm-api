const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const {
  selectOneBy: selectFileBy,
  updateBy: updateFilesBy,
} = require('../../../../../../models/v1/storage/files/repositories')
const {
  selectOneBy: selectFolderBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/storage/files/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../../models/v1/storage/folders/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/storage/files/:id', () => {
  const accountId = 'accountId'
  const folderId = 'folderId'
  const id = 'id'

  const body = 'body'

  const req = {
    user: { accountId },
    params: { id },
    body,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const results = 204
    const name = 'name'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({ folderId, name })
    selectFileBy.mockResolvedValue('file')
    selectFolderBy.mockResolvedValue('folder')
    updateFilesBy.mockResolvedValue({ folderId })

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectFileBy).toBeCalledWith({ id, accountId })
    expect(selectFolderBy).toBeCalledWith({ accountId, id: folderId })
    expect(updateFilesBy).toBeCalledWith(
      { id, accountId },
      { folderId, originalFileName: name },
    )
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.storage.*`)
    expect(sendStatus).toBeCalledWith(204)
  })

  it('should throw an error if file does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({})
    selectFileBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectFileBy).toBeCalledWith({ id, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if folder does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ folderId })
    selectFileBy.mockResolvedValue('file')
    selectFolderBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectFileBy).toBeCalledWith({ id, accountId })
    expect(selectFolderBy).toBeCalledWith({ accountId, id: folderId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { folderId: ['notExists'] },
    })
  })
})
