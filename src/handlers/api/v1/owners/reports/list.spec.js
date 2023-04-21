const { handler } = require('../../../../../services/http')
const {
  selectBy: selectReportsBy,
} = require('../../../../../models/v1/owner-reports/repositories')
const {
  serialize,
} = require('../../../../../models/v1/owner-reports/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/owner-reports/repositories')
jest.mock('../../../../../models/v1/owner-reports/serializers')

const httpHandler = require('./list')

describe('GET /v1/owners/reports', () => {
  const ownerId = 1
  const accountId = 2

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = [
      { id: 1, name: 'Report 1' },
      { id: 2, name: 'Report 2' },
    ]
    const pagination = 'pagination'
    const response = { data, meta: { pagination } }
    const perPage = 10
    const currentPage = 1

    const json = jest.fn().mockImplementation((args) => args)
    const paginate = jest.fn().mockResolvedValue({ data, pagination })
    serialize.mockReturnValue(data)

    selectReportsBy.mockReturnValue({ paginate })

    await expect(httpHandler({ user: { id: ownerId, accountId }, query: { perPage, currentPage } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(serialize).toBeCalledWith([], data)
    expect(json).toBeCalledWith(response)
    expect(paginate).toBeCalledWith({ perPage: 10, currentPage: 1, isLengthAware: true })
    expect(selectReportsBy).toBeCalledWith({ accountId, ownerId })
  })
})
