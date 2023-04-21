const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create, selectOneBy } = require('../../../../../models/v1/sales-channels/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/sales-channels/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/sales-channels/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/sales-channels', () => {
  const id = 'id'
  const accountId = 'accountId'

  const body = 'body'
  const payload = { name: 'value' }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const statusCode = 201

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(payload)
    create.mockResolvedValue(id)

    await expect(httpHandler({ user: { accountId }, body }, { status }))
      .resolves.toEqual({ data: { id } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(create).toBeCalledWith({ ...payload, accountId })
    expect(status).toBeCalledWith(statusCode)
    expect(json).toBeCalledWith({ data: { id } })
  })

  it('should throw an error when name already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue('saleChannel')

    await expect(httpHandler({ body, user: { accountId }, params: { id } })).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, name: payload.name })
    expect(create).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        name: ['unique'],
      },
    })
  })
})
