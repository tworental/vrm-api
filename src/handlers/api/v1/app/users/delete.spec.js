const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/users/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/users/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/users/:id', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    deleteBy.mockResolvedValue()
    selectOneBy.mockResolvedValue({
      id: 2,
      isAccountOwner: false,
    })

    await expect(httpHandler({ user: { id: 1, accountId: 100 }, params: { id: 2 } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id: 2, accountId: 100 })
    expect(deleteBy).toBeCalledWith({ id: 2 })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if user does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { id: 1, accountId: 100 }, params: { id: 2 } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id: 2, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when user tries remove him self', async () => {
    const errorMessage = 'You can not delete yourself'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue({ id: 1 })

    await expect(httpHandler({ user: { id: 1, accountId: 100 }, params: { id: 1 } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id: 1, accountId: 100 })
    expect(createError).toBeCalledWith(400, errorMessage)
  })

  it('should throw an error when user tries remove an owner of account', async () => {
    const errorMessage = 'User who is an owner of the account can not be deleted'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue({ id: 2, isAccountOwner: true })

    await expect(httpHandler({ user: { id: 1, accountId: 100 }, params: { id: 2 } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id: 2, accountId: 100 })
    expect(createError).toBeCalledWith(400, errorMessage)
  })
})
