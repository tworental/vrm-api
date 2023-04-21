const { randomBytes } = require('crypto')
const config = require('config')

const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { frontendUrl } = require('../../../../../services/frontend')
const { selectOneBy } = require('../../../../../models/v1/owners/repositories')
const { createToken } = require('../../../../../models/v1/owner-tokens/repositories')

jest.mock('crypto')
jest.mock('config')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../services/frontend')
jest.mock('../../../../../models/v1/owners/repositories')
jest.mock('../../../../../models/v1/owner-tokens/repositories')

const httpHandler = require('./invite')

describe('POST /v1/app/owners/:id/invite', () => {
  const body = 'body'
  const lang = 'en'
  const id = 'id'
  const identifier = 'identifier'
  const accountId = 'accountId'

  const req = {
    body,
    headers: { lang },
    account: { identifier },
    params: { id },
    user: { accountId },
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return an user details', async () => {
    const token = 'TOKEN'
    const password = 'password'
    const statusCode = 202
    const results = { id: 1, email: 'username@domain.com', firstName: 'John' }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const toString = jest.fn().mockReturnValue(password)
    const confirmationUrl = 'confirmationUrl'

    randomBytes.mockReturnValue({ toString })
    selectOneBy.mockResolvedValue(results)
    createToken.mockReturnValue(token)
    frontendUrl.mockReturnValue(confirmationUrl)
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createToken).toBeCalledWith(id, results.email, 'confirmation')
    expect(frontendUrl).toBeCalledWith(
      'frontend.owners.endpoint',
      identifier,
      'frontend.owners.paths.accountConfirmation',
      { email: results.email, token },
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'frontend.owners.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.owners.paths.accountConfirmation')
    expect(sendMail).toBeCalledWith('owners-app-invitation', lang, results.email, {
      firstName: results.firstName,
      identifier,
      confirmationUrl,
      password,
      email: results.email,
    })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if owner does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
