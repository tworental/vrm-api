const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const {
  selectOneWithAccount,
  generatePassword,
  updateById,
} = require('../../../../../../models/v1/owners/repositories')
const {
  checkToken,
  deleteBy: deleteTokenBy,
} = require('../../../../../../models/v1/owner-tokens/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/owners/repositories')
jest.mock('../../../../../../models/v1/owner-tokens/repositories')

const httpHandler = require('./change')

describe('change password service', () => {
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
    const owner = {
      id: 1,
    }
    const ownerToken = 'owner-token'
    const encryptedPassword = 'hash'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(owner)
    checkToken.mockResolvedValue(ownerToken)
    generatePassword.mockResolvedValue(encryptedPassword)
    updateById.mockResolvedValue(owner)
    deleteTokenBy.mockResolvedValue(owner)

    await expect(httpHandler({ query: { token, email }, body, headers }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(checkToken).toBeCalledWith(owner.id, token, 'reset')
    expect(generatePassword).toBeCalledWith(password)
    expect(updateById).toBeCalledWith(owner.id, { encryptedPassword })
    expect(deleteTokenBy).toBeCalledWith({ ownerId: owner.id, type: 'reset' })
    expect(sendStatus).toBeCalledWith(204)
  })

  it('should throw an error if a owner is not present', async () => {
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

  it('should throw an error if a owner token is not present', async () => {
    const errorMessage = 'Invalid Credentials'
    const owner = {
      id: 1,
    }

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(owner)
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
