const cache = require('../../../../../../../../services/cacheManager')
const createError = require('../../../../../../../../services/errors')
const { handler } = require('../../../../../../../../services/http')
const { selectOneWithAccount, updateById } = require('../../../../../../../../models/v1/users/repositories')
const { deleteBy: deleteTokenBy, checkToken } = require('../../../../../../../../models/v1/user-tokens/repositories')

jest.mock('../../../../../../../../services/cacheManager')
jest.mock('../../../../../../../../services/errors')
jest.mock('../../../../../../../../services/http')
jest.mock('../../../../../../../../models/v1/users/repositories')
jest.mock('../../../../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./confirm')

describe('POST /v1/app/auth/account/verification/email/confirm', () => {
  const time = 1479427200000
  const email = 'johndoe@domain.com'
  const identifier = 'organization'
  const headers = {
    'x-org-id': identifier,
  }
  const token = 'token'

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should allow to confirm an account', async () => {
    const user = {
      id: 1,
      accountId: 1,
      confirmedAt: 1,
    }
    const userToken = 'user-token'
    const statusCode = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(user)
    checkToken.mockResolvedValue(userToken)
    deleteTokenBy.mockResolvedValue(user)

    await expect(httpHandler({ query: { email, token }, headers }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(checkToken).toBeCalledWith(user.id, token, 'confirmation')
    expect(deleteTokenBy).toBeCalledWith({ userId: user.id, type: 'confirmation' })
    expect(cache.del).toBeCalledWith(`accounts.${user.accountId}.users.${user.id}`)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if a user is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(null)

    await expect(httpHandler({ query: { email, token }, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { token: ['invalid'] },
    })
  })

  it('should throw an error if a user token is not present', async () => {
    const errorMessage = 'Invalid Credentials'
    const user = {
      id: 1,
      confirmedAt: 1,
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(user)
    checkToken.mockResolvedValue(null)

    await expect(httpHandler({ query: { email, token }, headers }))
      .rejects.toThrow(errorMessage)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { token: ['invalid'] },
    })
  })

  it('should set confirmation if not set', async () => {
    const user = {
      id: 1,
      confirmedAt: null,
    }
    const userToken = 'user-token'
    const statusCode = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(user)
    checkToken.mockResolvedValue(userToken)
    updateById.mockResolvedValue(user)
    deleteTokenBy.mockResolvedValue(user)

    await expect(httpHandler({ query: { email, token }, headers }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(checkToken).toBeCalledWith(user.id, token, 'confirmation')
    expect(updateById).toBeCalledWith(user.id, {
      confirmedAt: new Date(Date.now()),
    })
    expect(deleteTokenBy).toBeCalledWith({ userId: user.id, type: 'confirmation' })
    expect(sendStatus).toBeCalledWith(statusCode)
  })
})
