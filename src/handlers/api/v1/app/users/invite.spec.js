const config = require('config')
const { randomBytes } = require('crypto')

const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { frontendUrl } = require('../../../../../services/frontend')
const { selectOneBy: selectUserBy } = require('../../../../../models/v1/users/repositories')
const { createToken } = require('../../../../../models/v1/user-tokens/repositories')

jest.mock('config')
jest.mock('crypto')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../services/frontend')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./invite')

describe('GET /v1/app/users/:id/invite', () => {
  const body = 'body'
  const lang = 'en'
  const id = 'id'
  const identifier = 'identifier'
  const accountId = 'accountId'
  const email = 'johdoe@domain.com'

  const req = {
    body,
    headers: { lang },
    account: { identifier },
    params: { id: 1000 },
    user: {
      id,
      accountId,
      email,
    },
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return an user details', async () => {
    const token = 'TOKEN'
    const password = 'password'
    const statusCode = 202
    const results = { id: 1, email: 'username@domain.com' }

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const toString = jest.fn().mockReturnValue(password)
    const confirmationUrl = 'confirmationUrl'

    const where = jest.fn().mockResolvedValue(results)

    randomBytes.mockReturnValue({ toString })
    selectUserBy.mockReturnValue({ where })
    createToken.mockReturnValue(token)
    frontendUrl.mockReturnValue(confirmationUrl)
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(where).toBeCalledWith('id', '!=', id)
    expect(selectUserBy).toBeCalledWith({ accountId, id: 1000 })
    expect(createToken).toBeCalledWith(results.id, email, 'confirmation')
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.accountConfirmation',
      { email: results.email, token },
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.app.paths.accountConfirmation')
    expect(sendMail).toBeCalledWith('users-team-invitation', lang, results.email, {
      email,
      confirmationUrl,
      identifier,
      password,
    })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if user does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue(null)
    selectUserBy.mockReturnValue({ where })

    await expect(httpHandler(req))
      .rejects.toThrow(errorMessage)

    expect(where).toBeCalledWith('id', '!=', id)
    expect(selectUserBy).toBeCalledWith({ accountId, id: 1000 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
