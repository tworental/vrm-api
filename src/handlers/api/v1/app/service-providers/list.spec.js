const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/service-providers/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/service-providers/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/service-providers/repositories')
jest.mock('../../../../../models/v1/service-providers/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/service-providers', () => {
  it('should display all resources', async () => {
    const accountId = 'accountId'
    const data = ['services']
    const results = 'services'

    const json = jest.fn().mockImplementation((args) => args)

    selectBy.mockResolvedValue(results)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId } }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results)
    expect(json).toBeCalledWith({ data })
  })
})
