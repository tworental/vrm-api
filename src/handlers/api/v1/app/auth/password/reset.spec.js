const config = require('config')

const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { sendMail } = require('../../../../../../services/mailing')
const { frontendUrl } = require('../../../../../../services/frontend')
const { debugInfo } = require('../../../../../../services/debug')
const { selectOneWithAccount } = require('../../../../../../models/v1/users/repositories')
const { createToken } = require('../../../../../../models/v1/user-tokens/repositories')

jest.mock('config')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/mailing')
jest.mock('../../../../../../services/frontend')
jest.mock('../../../../../../services/debug')
jest.mock('../../../../../../models/v1/users/repositories')
jest.mock('../../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./reset')

describe('POST /v1/app/auth/password/reset', () => {
  const email = 'johndoe@domain.com'
  const identifier = 'organization'
  const headers = {
    'x-org-id': identifier,
    lang: 'en',
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should allow to reset a password', async () => {
    const user = {
      id: 1,
      firstName: 'first-name',
    }
    const id = 1
    const firstName = 'first-name'
    const token = 'token'
    const changePasswordUrl = 'change-password'
    const resetPasswordUrl = 'reset-password'
    const results = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const res = { sendStatus }

    selectOneWithAccount.mockResolvedValue(user)
    createToken.mockResolvedValue(token)
    frontendUrl.mockReturnValueOnce(changePasswordUrl)
    frontendUrl.mockReturnValueOnce(resetPasswordUrl)
    sendMail.mockResolvedValue(user)

    await expect(httpHandler({ body: { email }, headers }, res))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(createToken).toBeCalledWith(id, email, 'reset')
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.changePassword',
      { email, token },
    )
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.resetPassword',
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.app.paths.changePassword')
    expect(config.get).toHaveBeenNthCalledWith(3, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(4, 'frontend.app.paths.resetPassword')
    expect(sendMail).toBeCalledWith('users-request-reset-password', headers.lang, email, {
      changePasswordUrl,
      resetPasswordUrl,
      firstName,
      email,
    })
    expect(debugInfo).toBeCalledWith(res, { resetPasswordUrl })
    expect(sendStatus).toBeCalledWith(202)
  })

  it('should throw an error if a user is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(null)

    await expect(httpHandler({ body: { email }, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { email: ['invalid'] },
    })
  })
})
