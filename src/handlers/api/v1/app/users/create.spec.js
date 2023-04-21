const config = require('config')
const { randomBytes } = require('crypto')

const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { validate } = require('../../../../../services/validate')
const { frontendUrl } = require('../../../../../services/frontend')
const { createTransaction } = require('../../../../../services/database')
const { create: createUser, selectOneBy: selectUserBy } = require('../../../../../models/v1/users/repositories')
const { create: createUserSettings } = require('../../../../../models/v1/user-settings/repositories')
const { setPermissions } = require('../../../../../models/v1/permission-users/repositories')
const { createToken } = require('../../../../../models/v1/user-tokens/repositories')
const { getLimitByKey } = require('../../../../../models/v1/limits/repositories')
const { INVITATION_SCHEMA } = require('../../../../../models/v1/users/schema')

jest.mock('config')
jest.mock('crypto')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/frontend')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/user-settings/repositories')
jest.mock('../../../../../models/v1/permission-users/repositories')
jest.mock('../../../../../models/v1/user-tokens/repositories')
jest.mock('../../../../../models/v1/limits/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/users', () => {
  const body = 'body'
  const lang = 'en'
  const identifier = 'identifier'
  const accountId = 'accountId'
  const loggedUserEmail = 'johdoe@domain.com'
  const email = 'username@domain.com'
  const timezone = 'UTC'
  const locale = 'en_US'
  const language = null
  const limits = [
    { name: 'account.module.languages.default', value: 'ru' },
  ]

  const req = {
    body,
    limits,
    headers: { lang },
    account: { identifier },
    user: {
      accountId,
      email: loggedUserEmail,
      settings: { timezone, locale, language },
    },
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const statusCode = 201

    const password = 'pa$$word'
    const token = 'token'
    const trx = 'transaction'
    const userId = 'userId'
    const confirmationUrl = 'confirmationUrl'
    const permissions = []

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const toString = jest.fn().mockReturnValue(password)

    validate.mockResolvedValue({ email, permissions })
    selectUserBy.mockResolvedValue(null)
    randomBytes.mockReturnValue({ toString })
    createTransaction.mockImplementation((fn) => fn(trx))
    createUser.mockResolvedValue(userId)
    createUserSettings.mockResolvedValue()
    setPermissions.mockResolvedValue()
    createToken.mockReturnValue(token)
    getLimitByKey.mockReturnValue('de')
    frontendUrl.mockReturnValue(confirmationUrl)
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: INVITATION_SCHEMA })
    expect(selectUserBy).toBeCalledWith({ accountId, email })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createUser).toBeCalledWith({
      accountId, email, password, isAccountOwner: false,
    }, trx)
    expect(getLimitByKey).toBeCalledWith('account.module.languages.default', limits, 'en')
    expect(createUserSettings).toBeCalledWith({
      userId, timezone, locale, language: 'de',
    }, trx)
    expect(setPermissions).toBeCalledWith(accountId, userId, permissions, trx)
    expect(createToken).toBeCalledWith(userId, email, 'confirmation', trx)
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.accountConfirmation',
      { email, token },
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.app.paths.accountConfirmation')
    expect(sendMail).toBeCalledWith('users-team-invitation', lang, email, {
      email: loggedUserEmail,
      confirmationUrl,
      identifier,
      password,
    })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when user already exists', async () => {
    const errorMessage = 'User already exists'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ email })
    selectUserBy.mockResolvedValue(accountId)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: INVITATION_SCHEMA })
    expect(selectUserBy).toBeCalledWith({ accountId, email })
    expect(createError).toBeCalledWith(400, errorMessage)
  })
})
