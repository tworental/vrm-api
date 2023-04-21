const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  getTreeIds,
  selectBy: selectFoldersBy,
  updateBy: updateFoldersBy,
} = require('../../../../../../models/v1/storage/folders/repositories')
const {
  updateBy: updateFilesBy,
} = require('../../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/storage/folders/repositories')
jest.mock('../../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/storage/folder', () => {
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete resources by ids', async () => {
    const trx = 'trx'
    const ids = [1, 2]
    const req = { user: { accountId }, query: { ids } }

    const time = 1479427200000

    const results = 204
    const folders = ['folder']

    const sendStatus = jest.fn().mockImplementation((args) => args)

    jest.spyOn(Date, 'now').mockImplementation(() => time)

    createTransaction.mockImplementation((fn) => fn(trx))

    selectFoldersBy.mockResolvedValue(folders)
    getTreeIds.mockReturnValueOnce(ids)

    const foldersWhereIn = jest.fn().mockResolvedValue()
    const filesWhereIn = jest.fn().mockResolvedValue()

    updateFoldersBy.mockReturnValue({ whereIn: foldersWhereIn })
    updateFilesBy.mockReturnValue({ whereIn: filesWhereIn })

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectFoldersBy).toBeCalledWith({ accountId, system: '0' })
    expect(getTreeIds).toBeCalledWith(folders, req.query.ids)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(foldersWhereIn).toBeCalledWith('id', ids)
    expect(filesWhereIn).toBeCalledWith('folderId', ids)
    expect(updateFoldersBy).toBeCalledWith({ accountId }, { deletedAt: new Date(time) }, trx)
    expect(updateFilesBy).toBeCalledWith({ accountId }, { deletedAt: new Date(time) }, trx)
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

    const folders = [{ id: 1000 }]

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
    expect(selectFoldersBy).toBeCalledWith({ accountId, system: '0' })
    expect(getTreeIds).toBeCalledWith(folders, req.query.ids)
    expect(createTransaction).not.toBeCalled()
  })
})
