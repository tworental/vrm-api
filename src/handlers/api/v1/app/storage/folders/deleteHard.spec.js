const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { deleteFiles } = require('../../../../../../services/s3')
const { handler } = require('../../../../../../services/http')
const {
  getTreeIds,
  selectBy: selectFoldersBy,
  deleteBy: deleteFoldersBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const {
  selectBy: selectFilesBy,
} = require('../../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/storage/folders/repositories')
jest.mock('../../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./deleteHard')

describe('DELETE /v1/app/storage/folders/delete/hard', () => {
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete folders by ids', async () => {
    const ids = [1, 2]
    const req = { user: { accountId }, query: { ids } }

    const results = 204
    const folders = ['folder1']

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectFoldersBy.mockResolvedValue(folders)
    getTreeIds.mockReturnValueOnce(ids)

    const filesWhereIn = jest.fn().mockResolvedValue([
      { id: 1, path: 'path1' },
      { id: 2, path: 'path2' },
    ])

    const foldersWhereIn = jest.fn().mockResolvedValue()

    selectFilesBy.mockReturnValue({ whereIn: filesWhereIn })
    deleteFoldersBy.mockReturnValue({ whereIn: foldersWhereIn })

    deleteFiles.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectFoldersBy).toBeCalledWith({ accountId, system: '0', __deleted: 1 })
    expect(getTreeIds).toBeCalledWith(folders, ids)
    expect(selectFilesBy).toBeCalledWith({ accountId, __deleted: 1 })
    expect(filesWhereIn).toBeCalledWith('folderId', ids)
    expect(deleteFiles).toBeCalledWith(['path1', 'path2'])
    expect(deleteFoldersBy).toBeCalledWith({ accountId, __deleted: 1 })
    expect(foldersWhereIn).toBeCalledWith('id', ids)
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.storage.*`)
    expect(sendStatus).toBeCalledWith(204)
  })

  it('should throw an error when ids params does not exists', async () => {
    const req = { user: { accountId }, query: {} }

    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: [{ ids: 'required' }],
    })
    expect(selectFoldersBy).not.toBeCalled()
  })

  it('should throw an error when folders by ids could not be found', async () => {
    const req = { user: { accountId }, query: { ids: [1, 2] } }

    const folders = ['folder']

    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectFoldersBy.mockResolvedValue(folders)
    getTreeIds.mockReturnValue([])

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: [{ ids: 'notExists' }],
    })
    expect(selectFoldersBy).toBeCalledWith({ accountId, system: '0', __deleted: 1 })
    expect(getTreeIds).toBeCalledWith(folders, req.query.ids)
    expect(selectFilesBy).not.toBeCalled()
  })
})
