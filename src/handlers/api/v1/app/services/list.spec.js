const { raw } = require('../../../../../services/database')
const { handler } = require('../../../../../services/http')
const { selectBy: selectServicesBy } = require('../../../../../models/v1/services/repositories')
const { selectBy: selectServiceRemindersBy } = require('../../../../../models/v1/service-reminders/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/services/serializers')

jest.mock('../../../../../services/database')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/services/repositories')
jest.mock('../../../../../models/v1/service-reminders/repositories')
jest.mock('../../../../../models/v1/services/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/services', () => {
  it('should display all resources', async () => {
    const results = 'response'
    const accountId = 'accountId'

    const services = [{ id: 100 }]
    const serviceReminders = [{ id: 1, serviceId: 100 }]

    const json = jest.fn().mockImplementation((args) => args)

    const whereIn = jest.fn().mockResolvedValue(serviceReminders)
    const where = jest.fn().mockResolvedValue(services)
    const select = jest.fn().mockReturnValue({ where })
    const leftJoin = jest.fn().mockReturnValue({ select })

    raw.mockReturnValue('serviceProviderName')
    selectServicesBy.mockReturnValue({ leftJoin })
    selectServiceRemindersBy.mockReturnValue({ whereIn })
    serialize.mockReturnValue(results)

    await expect(httpHandler({ user: { accountId } }, { json }))
      .resolves.toEqual({ data: results })

    expect(handler).toBeCalled()
    expect(selectServicesBy).toBeCalled()
    expect(leftJoin).toBeCalledWith('service_providers', 'service_providers.id', 'services.serviceProviderId')
    expect(raw).toBeCalledWith('service_providers.name AS serviceProviderName')
    expect(select).toBeCalledWith(['services.*', 'serviceProviderName'])
    expect(where).toBeCalledWith('services.accountId', accountId)
    expect(selectServiceRemindersBy).toBeCalled()
    expect(whereIn).toBeCalledWith('serviceId', [100])
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, [
      { id: 100, totalReminders: 1 },
    ])
    expect(json).toBeCalledWith({ data: results })
  })
})
