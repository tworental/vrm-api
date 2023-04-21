const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../../models/v1/services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../../models/v1/service-reminders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/service-reminders/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/services/repositories')
jest.mock('../../../../../../models/v1/service-reminders/repositories')
jest.mock('../../../../../../models/v1/service-reminders/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/services/:serviceId/reminders', () => {
  const accountId = 'accountId'
  const serviceId = 'serviceId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = ['service']
    const results = 'services'

    const json = jest.fn().mockImplementation((args) => args)

    selectServiceBy.mockResolvedValue('service')
    selectServiceRemindersBy.mockResolvedValue(results)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { serviceId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(selectServiceRemindersBy).toBeCalledWith({ serviceId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when service does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { serviceId } }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ accountId, id: serviceId })
    expect(selectServiceRemindersBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
