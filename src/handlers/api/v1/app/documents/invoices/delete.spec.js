const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../../models/v1/documents/invoices/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/documents/invoices/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    deleteBy.mockResolvedValue()
    selectOneBy.mockResolvedValue({ id })

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(deleteBy).toBeCalledWith({ id })
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(cache.del).toBeCalledWith(['accounts.100.invoices.pagination.*'])
  })

  it('should throw an error if resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
