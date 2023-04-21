const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create } = require('../../../../../models/v1/rate-seasons/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/rate-seasons/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/rate-seasons/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/rate-seasons', () => {
  it('should create a resource', async () => {
    const statusCode = 201
    const accountId = 'accountId'
    const id = 'id'
    const body = 'body'

    const payload = { key: 'value' }

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
})
