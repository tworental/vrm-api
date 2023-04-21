const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy } = require('../../../../../../models/v1/storage/files/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/storage/files/serializers')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../../models/v1/storage/files/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/storage/files/:id', () => {
  const cacheKey = 'cacheKey'

  const accountId = 'accountId'
  const id = 'id'

  const req = {
    user: { accountId },
    params: { id },
  }

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const data = {
      id: 'id',
      folderId: 'folderId',
      uuid: 'uuid',
      originalFileName: 'originalFileName',
      size: 'size',
      mimeType: 'mimeType',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(data)
    serialize.mockReturnValue(data)

    await expect(httpHandler(req, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.storage.files.show.%s', accountId, id)
    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if a file does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.storage.files.show.%s', accountId, id)
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(serialize).not.toBeCalled()
  })
})
