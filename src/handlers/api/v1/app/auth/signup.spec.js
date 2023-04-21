const config = require('config')

const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { sendMail } = require('../../../../../services/mailing')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { frontendUrl, domainName } = require('../../../../../services/frontend')
const { isEmailBlacklisted, isIpBlacklisted } = require('../../../../../services/blacklist')
const { debugInfo } = require('../../../../../services/debug')
const slack = require('../../../../../services/slack')
const { create: createUser } = require('../../../../../models/v1/users/repositories')
const { create: createUserSettings } = require('../../../../../models/v1/user-settings/repositories')
const { create: createAccountSettings } = require('../../../../../models/v1/account-settings/repositories')
const {
  create: createAccount,
  selectOneBy: getAccountBy,
  trialExpirationDate: getAccountExpirationDate,
} = require('../../../../../models/v1/accounts/repositories')
const { selectOneBy: getPackageBy } = require('../../../../../models/v1/packages/repositories')
const { createToken } = require('../../../../../models/v1/user-tokens/repositories')
const {
  createDefaults: createDefaultSalesChannels,
} = require('../../../../../models/v1/sales-channels/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/accounts/schema')

jest.mock('config')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/frontend')
jest.mock('../../../../../services/blacklist')
jest.mock('../../../../../services/debug')
jest.mock('../../../../../services/slack')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/user-settings/repositories')
jest.mock('../../../../../models/v1/account-settings/repositories')
jest.mock('../../../../../models/v1/accounts/repositories')
jest.mock('../../../../../models/v1/packages/repositories')
jest.mock('../../../../../models/v1/user-tokens/repositories')
jest.mock('../../../../../models/v1/sales-channels/repositories')

const httpHandler = require('./signup')

describe('POST /v1/app/auth/signup', () => {
  const packageId = 1
  const body = 'body'
  const lang = 'en'

  beforeEach(() => {
    config.get.mockImplementation((arg) => {
      if (arg === 'locales.availableLanguages') {
        return ['de']
      }
      return arg
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should signup an user', async () => {
    const results = 201

    const identifier = 'organization'
    const token = 'TOKEN'
    const firstName = 'John'
    const lastName = 'Doe'
    const email = 'email@domain.com'
    const phoneNumber = '+41777777777'
    const password = 'pa$$word'
    const domain = 'domain.com'
    const timezone = 'UTC'
    const locale = 'en_US'
    const language = 'en'

    const trx = 'transaction'

    const accountId = 10
    const userId = 10000
    const trialExpirationOn = 'trialExpirationOn'
    const confirmationUrl = 'confirmationUrl'

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const res = { sendStatus }

    validate.mockResolvedValue({
      packageId,
      identifier,
      email,
      password,
      phoneNumber,
      firstName,
      lastName,
      timezone,
      locale,
      language,
    })

    getPackageBy.mockResolvedValueOnce({ id: packageId })
    getPackageBy.mockResolvedValueOnce('package')
    getAccountBy.mockResolvedValue(null)
    isEmailBlacklisted.mockReturnValue(false)
    isIpBlacklisted.mockReturnValue(false)

    createTransaction.mockImplementation((fn) => fn(trx))
    getAccountExpirationDate.mockReturnValue(trialExpirationOn)

    createAccount.mockResolvedValue(accountId)
    createUser.mockResolvedValue(userId)
    createUserSettings.mockResolvedValue()
    createAccountSettings.mockResolvedValue()
    createToken.mockResolvedValue(token)
    createDefaultSalesChannels.mockResolvedValue()
    slack.postMessage.mockResolvedValue()

    domainName.mockReturnValue(domain)
    frontendUrl.mockReturnValue(confirmationUrl)

    await expect(httpHandler({ body, headers: { lang } }, res))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(getPackageBy).toHaveBeenNthCalledWith(1, { name: 'basic' })
    expect(getPackageBy).toHaveBeenNthCalledWith(2, { id: packageId })
    expect(getAccountBy).toBeCalledWith({ identifier })
    expect(createTransaction).toBeCalledWith(expect.any(Function))

    expect(createAccount).toBeCalledWith({ packageId, identifier, trialExpirationOn }, trx)
    expect(createUser).toBeCalledWith({
      accountId, email, password, phoneNumber, firstName, lastName, isAccountOwner: 1,
    }, trx)
    expect(createUserSettings).toBeCalledWith({
      userId, timezone, locale, language,
    }, trx)
    expect(createAccountSettings).toBeCalledWith({
      accountId, timezone, locale, language,
    }, trx)

    expect(createDefaultSalesChannels).toBeCalledWith(accountId, trx)
    expect(createToken).toBeCalledWith(userId, email, 'confirmation', trx)
    expect(domainName).toBeCalledWith('frontend.app.endpoint', identifier)
    expect(frontendUrl).toBeCalledWith(
      'frontend.app.endpoint',
      identifier,
      'frontend.app.paths.accountConfirmation',
      { email, token },
    )
    expect(config.get).toHaveBeenNthCalledWith(1, 'locales.availableLanguages')
    expect(config.get).toHaveBeenNthCalledWith(2, 'frontend.app.endpoint')
    expect(config.get).toHaveBeenNthCalledWith(3, 'frontend.app.paths.accountConfirmation')
    expect(config.get).toHaveBeenNthCalledWith(4, 'frontend.app.endpoint')
    expect(sendMail).toBeCalledWith('users-account-confirmation', lang, email, {
      confirmationUrl,
      domain,
      email,
      firstName,
    })
    expect(slack.postMessage).toBeCalledWith(
      'slack.channels.signupOrders',
      `New *FREE TRIAL* account was created: "*${identifier}*" :rocket:`,
    )
    expect(debugInfo).toBeCalledWith(res, { confirmationUrl })
  })

  it('should throw an error when a package does not exists', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ packageId })
    getPackageBy.mockResolvedValueOnce({ id: packageId })
    getPackageBy.mockResolvedValueOnce(null)

    await expect(httpHandler({ body, headers: { lang } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { package: ['notExists'] },
    })
  })

  it('should throw an error when an account already exists', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ packageId })
    getPackageBy.mockResolvedValueOnce({ id: packageId })
    getPackageBy.mockResolvedValueOnce('package')
    getAccountBy.mockResolvedValue('account')

    await expect(httpHandler({ body, headers: { lang } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { identifier: ['exists'] },
    })
  })

  it('should throw an error when email is black listed', async () => {
    const errorMessage = 'Blocked Email Address'
    const email = 'email'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ packageId, email })
    getPackageBy.mockResolvedValue({ id: packageId })
    isEmailBlacklisted.mockReturnValue(true)

    await expect(httpHandler({ body, headers: { lang } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage)
    expect(getPackageBy).toBeCalledWith({ name: 'basic' })
    expect(isEmailBlacklisted).toBeCalledWith(email)
    expect(isIpBlacklisted).not.toBeCalled()
  })

  it('should throw an error when IP is black listed', async () => {
    const errorMessage = 'Blocked IP Address'
    const clientIp = 'clientIp'
    const email = 'email'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ packageId, email })
    getPackageBy.mockResolvedValue({ id: packageId })
    isEmailBlacklisted.mockReturnValue(false)
    isIpBlacklisted.mockReturnValue(true)

    await expect(httpHandler({ body, clientIp, headers: { lang } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage)
    expect(getPackageBy).toBeCalledWith({ name: 'basic' })
    expect(isEmailBlacklisted).toBeCalledWith(email)
    expect(isIpBlacklisted).toBeCalledWith(clientIp)
  })
})
