const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/customer-contacts/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/customer-contacts/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/customer-contacts/repositories')
jest.mock('../../../../../models/v1/customer-contacts/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/customer-contacts', () => {
  it('should display all resource', async () => {
    const accountId = 'accountId'
    const id = 'id'

    const results = { data: { id } }

    const json = jest.fn().mockImplementation((args) => args)

    const orderBy = jest.fn().mockResolvedValue(results)

    selectBy.mockReturnValue({ orderBy })
    serialize.mockReturnValue(results.data)

    await expect(httpHandler({ user: { accountId } }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId })
    expect(orderBy).toBeCalledWith('is_default', 'desc')
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results)
    expect(json).toBeCalledWith(results)
  })
})
