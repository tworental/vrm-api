const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  selectOneBy: selectGuestBy,
  updateBy: updateGuestBy,
} = require('../../../../../models/v1/guests/repositories')
const {
  selectOneBy: selectCompanyBy,
} = require('../../../../../models/v1/companies/repositories')
const { upsertGuestToMailchimp } = require('../../../../../models/v1/integration-accounts/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/guests/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/guests/repositories')
jest.mock('../../../../../models/v1/companies/repositories')
jest.mock('../../../../../models/v1/integration-accounts/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/guests:id', () => {
  const body = 'body'
  const accountId = 'accountId'
  const companyId = 'companyId'
  const email = 'email'
  const phoneNumber = 'phoneNumber'
  const id = 100

  const req = {
    body,
    user: { accountId },
    params: { id },
  }

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

  it('should update a resource', async () => {
    const statusCode = 204
    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    selectGuestBy.mockResolvedValueOnce('data')
    selectCompanyBy.mockResolvedValue('guest')

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectGuestBy).toBeCalledWith({ accountId, id })
    expect(selectCompanyBy).toBeCalledWith({ accountId, id: payload.companyId })
    expect(updateGuestBy).toBeCalledWith({ id, accountId }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should update a mailchimp resource', async () => {
    const statusCode = 204
    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    selectGuestBy.mockResolvedValueOnce({ mailchimpId: 'mailchimp' })
    selectCompanyBy.mockResolvedValue('guest')
    const mailchimpFn = jest.fn().mockResolvedValue({ id: 'mailchimp' })
    upsertGuestToMailchimp.mockImplementation(() => mailchimpFn)

    await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectGuestBy).toBeCalledWith({ accountId, id })
    expect(selectCompanyBy).toBeCalledWith({ accountId, id: payload.companyId })
    expect(updateGuestBy).toBeCalledWith({ id, accountId }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(mailchimpFn).toBeCalledWith({ ...payload, mailchimpId: 'mailchimp' })
    expect(upsertGuestToMailchimp).toBeCalledWith(accountId)
  })

  it('should throw an error when guest does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectGuestBy.mockResolvedValueOnce(null)

    await expect(httpHandler(req)).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectGuestBy).toBeCalledWith({ accountId, id })
    expect(updateGuestBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })

  it('should throw an error when company does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectGuestBy.mockResolvedValueOnce('guest')
    selectCompanyBy.mockResolvedValue(null)

    await expect(httpHandler(req)).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectGuestBy).toBeCalledWith({ accountId, id })
    expect(selectCompanyBy).toBeCalledWith({ accountId, id: payload.companyId })
    expect(updateGuestBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        company: ['notExists'],
      },
    })
  })
})
