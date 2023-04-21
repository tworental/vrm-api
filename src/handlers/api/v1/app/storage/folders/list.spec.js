const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')
const { arrayToFlatTree } = require('../../../../../../services/utility')
const { selectBy: selectFilesBy } = require('../../../../../../models/v1/storage/files/repositories')
const { selectBy: selectFoldersBy } = require('../../../../../../models/v1/storage/folders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/storage/folders/serializers')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/utility')
jest.mock('../../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../../models/v1/storage/folders/repositories')
jest.mock('../../../../../../models/v1/storage/folders/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/storage/folders', () => {
  it('should returns a list of folders', async () => {
    const cacheKey = 'cacheKey'

    const accountId = 'accountId'
    const id = 'id'
    const deleted = '0'

    const req = { user: { accountId }, query: { id, deleted } }
    const res = { data: ['data'] }

    const folders = [{ id: 2 }]
    const files = [{ id: 1000, folderId: 2, size: 1000 }, { id: 2, folderId: 2 }]

    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)

    const json = jest.fn().mockImplementation((args) => args)
    const whereIn = jest.fn().mockResolvedValue(files)

    arrayToFlatTree.mockReturnValueOnce([{ id: 1 }, { id: 2 }])
    arrayToFlatTree.mockReturnValueOnce([{ id: 2 }])

    selectFoldersBy.mockResolvedValue(folders)
    selectFilesBy.mockReturnValue({ whereIn })
    serialize.mockReturnValue('data')

    await expect(httpHandler(req, { json })).resolves.toEqual(res)

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toHaveBeenNthCalledWith(
      1, 'accounts.%s.storage.folders.list.%s', accountId, { id, deleted },
    )
    expect(cache.key).toHaveBeenNthCalledWith(
      2, 'accounts.%s.storage.files.list.%s', accountId, { folderIds: [1, 2], deleted },
    )
    expect(selectFoldersBy).toBeCalledWith({
      accountId, folderId: id, hidden: '0', __deleted: deleted,
    })
    expect(selectFilesBy).toBeCalledWith({
      accountId, __deleted: deleted,
    })
    expect(whereIn).toBeCalledWith('folderId', [1, 2])
    expect(arrayToFlatTree).toHaveBeenNthCalledWith(1, folders, null, 'folderId')
    expect(arrayToFlatTree).toHaveBeenNthCalledWith(2, folders, 2, 'folderId')
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, folders[0], { files: 2, size: 1000 })
    expect(json).toBeCalledWith(res)
  })
})
