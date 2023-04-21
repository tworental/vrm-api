const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const {
  selectOneBy: selectProperty,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyServices,
  withServices,
} = require('../../../../../../models/v1/property-services/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/property-services/serializers')
const { selectBy: selectServiceRemindersBy } = require('../../../../../../models/v1/service-reminders/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-services/repositories')
jest.mock('../../../../../../models/v1/property-services/serializers')
jest.mock('../../../../../../models/v1/service-reminders/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/properties/:propertyId/services', () => {
  const accountId = 100
  const propertyId = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = [
      {
        id: 1,
        serviceId: 1,
      },
    ]

    const reminders = [
      { serviceId: 1 },
    ]

    const response = [
      {
        id: 1,
        serviceId: 1,
        totalReminders: 1,
      },
    ]

    const json = jest.fn().mockImplementation((args) => args)

    const whereIn = jest.fn().mockResolvedValue(reminders)

    selectProperty.mockResolvedValue({ id: propertyId })
    withServices.mockResolvedValue(data)
    selectServiceRemindersBy.mockReturnValue({ whereIn })

    serialize.mockReturnValue(response)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId } }, { json }))
      .resolves.toEqual({ data: response })

    expect(handler).toBeCalled()
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(selectPropertyServices).toBeCalledWith({ propertyId })
    expect(withServices).toBeCalled()
    expect(selectServiceRemindersBy).toBeCalled()
    expect(whereIn).toBeCalledWith('serviceId', [1])
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, response)
    expect(json).toBeCalledWith({ data: response })
  })

  it('should throw an error if property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({ account: { id: accountId }, params: { propertyId } }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(selectPropertyServices).not.toBeCalled()
  })
})
