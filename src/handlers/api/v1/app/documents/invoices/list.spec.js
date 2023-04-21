const cache = require('../../../../../../services/cacheManager')
const { handler } = require('../../../../../../services/http')
const { selectBy } = require('../../../../../../models/v1/documents/invoices/repositories')
const { serialize, PERMITED_COLLECTION_PARAMS } = require('../../../../../../models/v1/documents/invoices/serializers')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/documents/invoices/repositories')
jest.mock('../../../../../../models/v1/documents/invoices/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/documents/invoices', () => {
  it('should display all resources', async () => {
    const user = { id: 1, accountId: 1000 }
    const query = { perPage: 10, currentPage: 1 }
    const data = ['data']

    const results = { data, pagination: 'pagination' }
    const response = { data, meta: { pagination: results.pagination } }

    const json = jest.fn().mockImplementation((args) => args)
    const paginate = jest.fn().mockResolvedValue(results)
    const orderBy = jest.fn().mockReturnValue({ paginate })
    cache.wrap.mockImplementation((key, fn) => fn())
    selectBy.mockReturnValue({ orderBy })
    serialize.mockReturnValue(results.data)

    await expect(httpHandler({ user, query }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId: 1000 })
    expect(orderBy).toBeCalledWith('invoice_date', 'desc')
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data)
    expect(json).toBeCalledWith(response)
    expect(cache.wrap).toBeCalledWith('accounts.1000.invoices.pagination.10.1', expect.any(Function))
  })
})
