const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const { create: createServiceReminder } = require('../../../../../../models/v1/service-reminders/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/service-reminders/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/services/repositories')
jest.mock('../../../../../../models/v1/service-reminders/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/services/:serviceId/reminders', () => {
  const accountId = 'accountId'
  const serviceId = 'serviceId'
  const body = 'body'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource', async () => {
    const payload = { key: 'value' }

    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    selectServiceBy.mockResolvedValue('service')
    createServiceReminder.mockResolvedValue(serviceId)

    await expect(httpHandler({ user: { accountId }, params: { serviceId }, body }, { json }))
      .resolves.toEqual({ data: { id: serviceId } })

    expect(handler).toBeCalled()
    expect(selectServiceBy).toBeCalledWith({ id: serviceId, accountId })
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createServiceReminder).toBeCalledWith({ ...payload, serviceId })
    expect(json).toBeCalledWith({ data: { id: serviceId } })
  })

  it('should throw an error when service does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { serviceId }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ id: serviceId, accountId })
    expect(validate).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
