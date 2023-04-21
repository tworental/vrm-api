const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { deleteFiles } = require('../../../../../../services/s3')
const { deleteBy, selectBy } = require('../../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/s3')
jest.mock('../../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./deleteHard')

describe('DELETE /v1/app/storage/files/delete/hard', () => {
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete many files', async () => {
    const results = 204

    const files = [
      { id: 1, path: 'path1' },
    ]

    const req = {
      user: { accountId },
      query: { ids: [1, 2] },
    }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    const selectWhereIn = jest.fn().mockResolvedValue(files)
    const deleteWhereIn = jest.fn().mockResolvedValue()

    selectBy.mockReturnValue({ whereIn: selectWhereIn })
    deleteBy.mockReturnValue({ whereIn: deleteWhereIn })
    deleteFiles.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId, __deleted: 1 })
    expect(selectWhereIn).toBeCalledWith('id', req.query.ids)
    expect(deleteFiles).toBeCalledWith(['path1'])
    expect(deleteBy).toBeCalledWith({ accountId, __deleted: 1 })
    expect(deleteWhereIn).toBeCalledWith('id', req.query.ids)
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
    expect(selectBy).not.toBeCalled()
  })

  it('should throw an error when ids params is empty', async () => {
    const req = { user: { accountId }, query: { ids: [] } }

    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: [{ ids: 'required' }],
    })
    expect(selectBy).not.toBeCalled()
  })
})
