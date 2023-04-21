const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  create: createWebsite,
  selectOneBy: selectWebsiteBy,
} = require('../../../../../models/v1/websites/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/websites/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/websites/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/websites', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'
  const payload = {
    name: 'My website name',
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(payload)
    createWebsite.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, body }, { status }))
      .resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createWebsite).toBeCalledWith({ ...payload, accountId })
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error when website already exists', async () => {
    const errorMessage = 'Validation Failed'

    const { name } = payload

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectWebsiteBy.mockResolvedValue('name')

    await expect(httpHandler({ user: { accountId }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectWebsiteBy).toBeCalledWith({ accountId, name })
    expect(createWebsite).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { name: ['unique'] },
    })
  })
})
