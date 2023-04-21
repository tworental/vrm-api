const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const {
  selectOneBy: selectServiceReminderBy,
  deleteBy: deleteServiceReminderBy,
} = require('../../../../../../models/v1/service-reminders/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/services/repositories')
jest.mock('../../../../../../models/v1/service-reminders/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/services/:serviceId/reminders/:id', () => {
  const id = 'id'
  const accountId = 'accountId'
  const serviceId = 'serviceId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectServiceBy.mockResolvedValue('service')
    selectServiceReminderBy.mockResolvedValue('reminder')
    deleteServiceReminderBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { id, serviceId } }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(selectServiceReminderBy).toBeCalledWith({ id, serviceId })
    expect(deleteServiceReminderBy).toBeCalledWith({ id, serviceId })
    expect(sendStatus).toBeCalledWith(statusCode)
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
    expect(deleteServiceReminderBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
