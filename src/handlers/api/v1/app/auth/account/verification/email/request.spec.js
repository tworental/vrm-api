const config = require('config')

const createError = require('../../../../../../../../services/errors')
const { handler } = require('../../../../../../../../services/http')
const { sendMail } = require('../../../../../../../../services/mailing')
const { frontendUrl, domainName } = require('../../../../../../../../services/frontend')
const { selectOneWithAccount } = require('../../../../../../../../models/v1/users/repositories')
const { createToken } = require('../../../../../../../../models/v1/user-tokens/repositories')

jest.mock('config')
jest.mock('../../../../../../../../services/errors')
jest.mock('../../../../../../../../services/http')
jest.mock('../../../../../../../../services/mailing')
jest.mock('../../../../../../../../services/frontend')
jest.mock('../../../../../../../../models/v1/users/repositories')
jest.mock('../../../../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./request')

describe('POST /v1/app/auth/account/verification/email/request', () => {
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

  it('should allow to resend a confirmation request', async () => {
    const user = {
      id: 1,
      firstName: 'first-name',
    }
    const id = 1
    const firstName = 'first-name'
    const token = 'token'
    const domain = 'domain'
    const confirmationUrl = 'confirmation-url'
    const results = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const whereNull = jest.fn().mockReturnValue(user)

    selectOneWithAccount.mockReturnValue({ whereNull })
    createToken.mockResolvedValue(token)
    frontendUrl.mockReturnValueOnce(confirmationUrl)
    sendMail.mockResolvedValue(user)
    domainName.mockReturnValue(domain)

    await expect(httpHandler({ body: { email }, headers }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(whereNull).toBeCalledWith('confirmedAt')
    expect(createToken).toBeCalledWith(id, email, 'confirmation')
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.accountConfirmation',
      { email, token },
    )
    expect(domainName).toBeCalledWith('frontend.app.endpoint', identifier)
    expect(config.get).toHaveBeenNthCalledWith(1, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(3, 'frontend.app.paths.accountConfirmation')
    expect(sendMail).toBeCalledWith('users-account-confirmation', headers.lang, email, {
      confirmationUrl,
      firstName,
      email,
      domain,
    })
    expect(sendStatus).toBeCalledWith(202)
  })

  it('should throw an error if a user is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const whereNull = jest.fn().mockReturnValue(null)

    selectOneWithAccount.mockReturnValue({ whereNull })

    await expect(httpHandler({ body: { email }, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { email: ['invalid'] },
    })
  })
})
