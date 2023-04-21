const { randomBytes } = require('crypto')
const config = require('config')

const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { sendMail } = require('../../../../../services/mailing')
const { frontendUrl } = require('../../../../../services/frontend')
const {
  create: createOwner,
  selectOneBy: selectOwnerBy,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
  updateBy: updateUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const {
  create: createOwnerSettings,
} = require('../../../../../models/v1/owner-settings/repositories')
const { createToken } = require('../../../../../models/v1/owner-tokens/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/owners/schema')

jest.mock('crypto')
jest.mock('config')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/mailing')
jest.mock('../../../../../services/frontend')
jest.mock('../../../../../models/v1/owners/repositories')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/owner-settings/repositories')
jest.mock('../../../../../models/v1/owner-tokens/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/owners', () => {
  const body = 'body'
  const lang = 'en'
  const accountId = 'accountId'
  const identifier = 'identifier'
  const email = 'email'
  const phoneNumber = 'phoneNumber'
  const timezone = 'UTC'
  const locale = 'en_US'

  const req = {
    body,
    headers: { lang },
    user: { accountId, settings: { timezone, locale } },
    account: { identifier },
  }

  const statusCode = 201

  const trx = 'transaction'
  const ownerId = 'ownerId'
  const password = 'pa$$word'

  const payload = {
    email,
    phoneNumber,
    firstName: 'firstName',
    lastName: 'lastName',
    agencyCommission: 30.50,
    hasPanelAccess: 'hasPanelAccess',
    notes: 'notes',
  }

  const token = 'token'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const sendStatus = jest.fn().mockImplementation((args) => args)
    const toString = jest.fn().mockReturnValue(password)

    const whereIn = jest.fn().mockResolvedValue()

    validate.mockResolvedValue({ ...payload, units: [1, 5, 8, 10] })
    selectOwnerBy.mockResolvedValue(null)
    selectUnitsBy.mockResolvedValue([{ id: 1 }, { id: 8 }])
    randomBytes.mockReturnValue({ toString })
    createTransaction.mockImplementation((fn) => fn(trx))
    createOwner.mockResolvedValue(ownerId)
    createOwnerSettings.mockResolvedValue()
    updateUnitsBy.mockReturnValue({ whereIn })
    createToken.mockResolvedValue(token)
    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValue('url')
    sendMail.mockResolvedValue()

    await expect(httpHandler(req, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOwnerBy).toBeCalledWith({ accountId, email })
    expect(selectOwnerBy).toBeCalledWith({ accountId, phoneNumber })
    expect(selectUnitsBy).toBeCalledWith({ accountId, ownerId: null })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createOwner).toBeCalledWith({ accountId, password, ...payload }, trx)
    expect(createOwnerSettings).toBeCalledWith({ ownerId, timezone, locale }, trx)
    expect(updateUnitsBy).toBeCalledWith({}, { ownerId }, trx)
    expect(whereIn).toBeCalledWith('id', [1, 8])
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(createToken).toBeCalledWith(ownerId, email, 'confirmation', trx)
    expect(config.get).toBeCalledWith('frontend.owners.endpoint')
    expect(config.get).toBeCalledWith('frontend.owners.paths.accountConfirmation')
    expect(frontendUrl).toBeCalledWith('config', identifier, 'config', { email, token })
    expect(sendMail).toBeCalledWith('owners-app-invitation', lang, email, {
      firstName: payload.firstName,
      identifier,
      confirmationUrl: 'url',
      password,
      email,
    })
  })

  it('should throw an error when user phone number already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectOwnerBy.mockResolvedValueOnce(null)
    selectOwnerBy.mockResolvedValueOnce('owner')

    await expect(httpHandler(req)).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(1, { accountId, email })
    expect(selectOwnerBy).toHaveBeenNthCalledWith(2, { accountId, phoneNumber })
    expect(createOwner).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        phoneNumber: ['exists'],
      },
    })
  })

  it('should throw an error when user email already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ email })
    selectOwnerBy.mockResolvedValue(accountId)

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOwnerBy).toBeCalledWith({ accountId, email })
    expect(createOwner).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        email: ['exists'],
      },
    })
  })
})
