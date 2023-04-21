const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { getSignedUrl } = require('../../../../../../services/s3')
const { selectOneBy } = require('../../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./preview')

describe('GET /v1/app/storage/preview', () => {
  const cacheKey = 'cacheKey'

  const accountId = 'accountId'
  const uuid = 'uuid'

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should redirect to signed url', async () => {
    const url = 'url'
    const file = { name: 'file', path: 'path' }

    const redirect = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue(file)
    getSignedUrl.mockResolvedValue(url)

    await expect(httpHandler({ user: { accountId }, params: { uuid } }, { redirect }))
      .resolves.toEqual(url)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.storage.files.show.%s', accountId, uuid)
    expect(selectOneBy).toBeCalledWith({ uuid, accountId })
    expect(getSignedUrl).toBeCalledWith(file.path)
    expect(redirect).toBeCalledWith(url)
  })

  it('should throw an error when file does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { uuid } }))
      .rejects.toThrow(errorMessage)

    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.storage.files.show.%s', accountId, uuid)
    expect(selectOneBy).toBeCalledWith({ uuid, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
    expect(getSignedUrl).not.toBeCalled()
  })
})
