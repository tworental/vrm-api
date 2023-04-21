const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { create } = require('../../../../../models/v1/service-providers/repositories')
const { CREATE_SCHEMA } = require('../../../../../models/v1/service-providers/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/service-providers/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/service-providers', () => {
  it('should create a resource', async () => {
    const accountId = 'accountId'
    const body = 'body'
    const serviceId = 'serviceId'

    const payload = {
      key: 'value',
    }

    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    create.mockResolvedValue(serviceId)

    await expect(httpHandler({ user: { accountId }, body }, { json }))
      .resolves.toEqual({ data: { id: serviceId } })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(create).toBeCalledWith({ ...payload, accountId })
    expect(json).toBeCalledWith({ data: { id: serviceId } })
  })
})
