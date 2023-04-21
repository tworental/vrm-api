const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/websites/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/websites/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/websites/repositories')
jest.mock('../../../../../models/v1/websites/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/websites', () => {
  it('should display all resources', async () => {
    const accountId = 'accountId'
    const data = ['website']
    const results = 'websites'

    const json = jest.fn().mockImplementation((args) => args)

    selectBy.mockResolvedValue(results)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId } }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results, { currentVersion: 1 })
    expect(json).toBeCalledWith({ data })
  })
})
