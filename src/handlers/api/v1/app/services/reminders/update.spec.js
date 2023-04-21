const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const { updateBy: updateServiceReminderBy } = require('../../../../../../models/v1/service-reminders/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/service-reminders/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../models/v1/services/repositories')
jest.mock('../../../../../../models/v1/service-reminders/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/services/:serviceId/reminders/:id', () => {
  const accountId = 'accountId'
  const serviceId = 'serviceId'
  const id = 'id'
  const body = 'body'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200
    const payload = { name: 'name' }
    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectServiceBy.mockResolvedValue('service')
    validate.mockResolvedValue(payload)
    updateServiceReminderBy.mockResolvedValue('serviceReminder')

    await expect(httpHandler({ user: { accountId }, params: { id, serviceId }, body }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(updateServiceReminderBy).toBeCalledWith({ id, serviceId }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id, serviceId }, body }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(validate).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
