const config = require('config')

const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { sendMail } = require('../../../../../../services/mailing')
const { frontendUrl } = require('../../../../../../services/frontend')
const { debugInfo } = require('../../../../../../services/debug')
const { selectOneWithAccount } = require('../../../../../../models/v1/owners/repositories')
const { createToken } = require('../../../../../../models/v1/owner-tokens/repositories')

jest.mock('config')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/mailing')
jest.mock('../../../../../../services/frontend')
jest.mock('../../../../../../services/debug')
jest.mock('../../../../../../models/v1/owners/repositories')
jest.mock('../../../../../../models/v1/owner-tokens/repositories')

const httpHandler = require('./reset')

describe('reset password service', () => {
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
    const owner = {
      id: 1,
      firstName: 'first-name',
    }
    const id = 1
    const token = 'token'
    const changePasswordUrl = 'change-password'
    const resetPasswordUrl = 'reset-password'
    const results = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const res = { sendStatus }

    selectOneWithAccount.mockResolvedValue(owner)
    createToken.mockResolvedValue(token)
    frontendUrl.mockReturnValueOnce(changePasswordUrl)
    frontendUrl.mockReturnValueOnce(resetPasswordUrl)
    sendMail.mockResolvedValue(owner)

    await expect(httpHandler({ body: { email }, headers }, res))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(createToken).toBeCalledWith(id, email, 'reset')
    expect(frontendUrl).toBeCalledWith(
      'frontend.owners.endpoint',
      identifier,
      'frontend.owners.paths.changePassword',
      { email, token },
    )
    expect(frontendUrl).toBeCalledWith(
      'frontend.owners.endpoint',
      identifier,
      'frontend.owners.paths.resetPassword',
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'frontend.owners.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.owners.paths.changePassword')
    expect(config.get).toHaveBeenNthCalledWith(3, 'frontend.owners.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(4, 'frontend.owners.paths.resetPassword')
    expect(sendMail).toBeCalledWith('owners-request-reset-password', headers.lang, email, {
      changePasswordUrl,
      resetPasswordUrl,
      email,
    })
    expect(debugInfo).toBeCalledWith(res, { resetPasswordUrl })
    expect(sendStatus).toBeCalledWith(202)
  })

  it('should throw an error if a owner is not present', async () => {
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
