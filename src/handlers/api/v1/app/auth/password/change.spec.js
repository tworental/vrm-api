const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneWithAccount, updateById, generatePassword } = require('../../../../../../models/v1/users/repositories')
const { checkToken, deleteBy: deleteTokenBy } = require('../../../../../../models/v1/user-tokens/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/users/repositories')
jest.mock('../../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./change')

describe('PATCH /v1/app/auth/password/change', () => {
  const token = 'token'
  const email = 'johndoe@domain.com'
  const body = 'body'
  const identifier = 'organization'
  const headers = {
    'x-org-id': identifier,
  }
  const { password } = 'pa$$word'

  it('should allow to change password', async () => {
    const results = 204
    const user = {
      id: 1,
    }
    const userToken = 'user-token'
    const encryptedPassword = 'hash'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(user)
    checkToken.mockResolvedValue(userToken)
    generatePassword.mockResolvedValue(encryptedPassword)
    updateById.mockResolvedValue(user)
    deleteTokenBy.mockResolvedValue(user)

    await expect(httpHandler({ query: { token, email }, body, headers }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(checkToken).toBeCalledWith(user.id, token, 'reset')
    expect(generatePassword).toBeCalledWith(password)
    expect(updateById).toBeCalledWith(user.id, { encryptedPassword })
    expect(deleteTokenBy).toBeCalledWith({ userId: user.id, type: 'reset' })
    expect(sendStatus).toBeCalledWith(204)
  })

  it('should throw an error if a user is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(null)

    await expect(httpHandler({ query: { token, email }, body, headers }))
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
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(user)
    checkToken.mockResolvedValue(null)

    await expect(httpHandler({ query: { token, email }, body, headers }))
      .rejects.toThrow(errorMessage)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { token: ['invalid'] },
    })
  })
})
