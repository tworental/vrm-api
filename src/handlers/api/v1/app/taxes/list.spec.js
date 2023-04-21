const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/taxes/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/taxes/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/taxes/repositories')
jest.mock('../../../../../models/v1/taxes/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/taxes', () => {
  it('should display all resources', async () => {
    const accountId = 'accountId'
    const data = ['tax']
    const results = 'taxes'

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
