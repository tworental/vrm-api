const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const { selectOneBy: selectServiceReminderBy } = require('../../../../../../models/v1/service-reminders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/service-reminders/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/services/repositories')
jest.mock('../../../../../../models/v1/service-reminders/repositories')
jest.mock('../../../../../../models/v1/service-reminders/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/services/:serviceId/reminders/:id', () => {
  const id = 'id'
  const accountId = 'accountId'
  const serviceId = 'serviceId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const data = { id }
    const reminder = 'reminder'

    const json = jest.fn().mockImplementation((args) => args)

    selectServiceBy.mockResolvedValue('service')
    selectServiceReminderBy.mockResolvedValue(reminder)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id, serviceId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(selectServiceReminderBy).toBeCalledWith({ id, serviceId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, reminder)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when service does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id, serviceId } }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(selectServiceReminderBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue('service')
    selectServiceReminderBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id, serviceId } }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(selectServiceReminderBy).toBeCalledWith({ id, serviceId })
    expect(serialize).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
