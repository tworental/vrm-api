const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create: createGuest } = require('../../../../../models/v1/guests/repositories')
const { selectOneBy: selectCompanyBy } = require('../../../../../models/v1/companies/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/guests/schema')
const { upsertGuestToMailchimp } = require('../../../../../models/v1/integration-accounts/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/guests/repositories')
jest.mock('../../../../../models/v1/companies/repositories')
jest.mock('../../../../../models/v1/integration-accounts/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/guests', () => {
  const body = 'body'
  const lang = 'en'
  const accountId = 'accountId'
  const companyId = 'companyId'
  const email = 'email'
  const phoneNumber = 'phoneNumber'
  const timezone = 'UTC'
  const locale = 'en_US'

  const req = {
    body,
    headers: { lang },
    user: { accountId, settings: { timezone, locale } },
  }

  const guestId = 'guestId'

  const payload = {
    email,
    phoneNumber,
    firstName: 'firstName',
    lastName: 'lastName',
    notes: 'notes',
    companyId,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    selectCompanyBy.mockResolvedValue('guest')
    createGuest.mockResolvedValue(guestId)
    const mailchimpFn = jest.fn().mockResolvedValue({ id: 'mailchimp' })
    upsertGuestToMailchimp.mockImplementation(() => mailchimpFn)

    await expect(httpHandler(req, { json }))
      .resolves.toEqual({ data: { id: guestId } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectCompanyBy).toBeCalledWith({ accountId, id: payload.companyId })
    expect(createGuest).toBeCalledWith({ ...payload, accountId, mailchimpId: 'mailchimp' })
    expect(json).toBeCalledWith({ data: { id: guestId } })
    expect(upsertGuestToMailchimp).toBeCalledWith(accountId)
    expect(mailchimpFn).toBeCalledWith(payload)
  })

  it('should throw an error when guest company does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectCompanyBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectCompanyBy).toHaveBeenCalledWith({ accountId, id: payload.companyId })
    expect(createGuest).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        company: ['notExists'],
      },
    })
  })
})
