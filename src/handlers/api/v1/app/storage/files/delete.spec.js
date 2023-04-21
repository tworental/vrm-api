const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { updateBy } = require('../../../../../../models/v1/storage/files/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/storage/files/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/storage/files', () => {
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete resource', async () => {
    const time = 1479427200000
    const req = { user: { accountId }, query: { ids: [1, 2] } }

    const results = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    jest.spyOn(Date, 'now').mockImplementation(() => time)

    const whereIn = jest.fn().mockResolvedValue()

    updateBy.mockReturnValue({ whereIn })

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(whereIn).toBeCalledWith('id', [1, 2])
    expect(updateBy).toBeCalledWith({ accountId }, { deletedAt: new Date(time) })
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
    expect(updateBy).not.toBeCalled()
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
    expect(updateBy).not.toBeCalled()
  })
})
