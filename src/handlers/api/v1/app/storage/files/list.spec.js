const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')
const { selectBy: selectFilesBy } = require('../../../../../../models/v1/storage/files/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/storage/files/serializers')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../../models/v1/storage/files/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/storage/files', () => {
  it('should display all resources', async () => {
    const cacheKey = 'cacheKey'

    const accountId = 'accountId'
    const deleted = '0'
    const data = [{ id: 1000 }]

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)

    serialize.mockReturnValue(data[0])
    selectFilesBy.mockResolvedValue(data)

    await expect(httpHandler({ user: { accountId }, query: { deleted } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.storage.files.list.%s', accountId, { deleted })
    expect(selectFilesBy).toBeCalledWith({ accountId, __deleted: '0' })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data[0])
    expect(json).toBeCalledWith({ data })
  })
})
