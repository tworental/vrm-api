const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create, selectOneBy } = require('../../../../../models/v1/companies/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/companies/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/companies/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/companies', () => {
  const body = 'body'
  const lang = 'en'
  const accountId = 'accountId'
  const timezone = 'UTC'
  const locale = 'en_US'
  const companyId = 'companyId'

  const req = {
    body,
    headers: { lang },
    user: { accountId, settings: { timezone, locale } },
  }

  const payload = {
    name: 'name',
    accountId,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue(null)
    create.mockResolvedValue(companyId)

    await expect(httpHandler(req, { status }))
      .resolves.toEqual({ data: { id: companyId } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, name: payload.name })
    expect(create).toBeCalledWith({ ...payload, accountId })
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data: { id: companyId } })
  })

  it('should throw an error when company name already exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue('company')

    await expect(httpHandler(req)).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, name: payload.name })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        name: ['exists'],
      },
    })
  })
})
