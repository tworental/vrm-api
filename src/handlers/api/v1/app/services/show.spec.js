const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy: selectServiceBy } = require('../../../../../models/v1/services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../models/v1/service-reminders/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/services/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/services/repositories')
jest.mock('../../../../../models/v1/service-reminders/repositories')
jest.mock('../../../../../models/v1/services/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/services/:id', () => {
  const id = 'id'
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const service = { id }

    const data = { id }
    const reminders = [{ id: 100 }]

    const json = jest.fn().mockImplementation((args) => args)

    selectServiceBy.mockResolvedValue(service)
    selectServiceRemindersBy.mockResolvedValue(reminders)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectServiceBy).toBeCalledWith({ accountId, id })
    expect(selectServiceRemindersBy).toBeCalledWith({ serviceId: id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, service, { reminders })
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error when resource does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectServiceBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectServiceBy).toBeCalledWith({ accountId, id })
    expect(serialize).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
