const { handler } = require('../../../../../services/http')
const {
  withBooking,
  selectBy,
} = require('../../../../../models/v1/guests/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/guests/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/guests/repositories')
jest.mock('../../../../../models/v1/guests/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/guests', () => {
  it('should display all resource', async () => {
    const accountId = 'accountId'
    const id = 'id'
    const search = 'search'
    const queryBuilder = 'queryBuilder'

    const results = {
      data: { id },
      pagination: 'pagination',
    }

    const response = {
      data: { id },
      meta: { pagination: 'pagination' },
    }

    const json = jest.fn().mockImplementation((args) => args)

    const paginate = jest.fn().mockResolvedValue(results)

    const whereRaw = jest.fn()
    const where = jest.fn().mockReturnValue(queryBuilder)
    const whereFn = jest.fn().mockImplementation((fn) => {
      fn({ whereRaw })
      return { where }
    })

    withBooking.mockReturnValue({ paginate })
    selectBy.mockReturnValue({ where: whereFn })
    serialize.mockReturnValue(results.data)

    await expect(httpHandler({ user: { accountId }, query: { search } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(withBooking).toBeCalledWith(queryBuilder)
    expect(selectBy).toBeCalled()
    expect(where).toBeCalledWith('guests.account_id', '=', accountId)
    expect(whereFn).toBeCalledWith(expect.any(Function))
    expect(whereRaw).toBeCalledWith(`TRIM(CONCAT(first_name, " ", last_name)) LIKE "%${search}%"`)
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, results.data)
    expect(paginate).toBeCalledWith({ perPage: 10, currentPage: 1, isLengthAware: true })
    expect(json).toBeCalledWith(response)
  })
})
