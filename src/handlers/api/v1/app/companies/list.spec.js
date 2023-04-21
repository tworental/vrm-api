const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/companies/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/companies/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/companies/repositories')
jest.mock('../../../../../models/v1/companies/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/companies', () => {
  it('should display all resources', async () => {
    const accountId = 'accountId'

    const rows = ['guest']
    const data = [{ id: 1 }]

    const json = jest.fn().mockImplementation((args) => args)

    selectBy.mockResolvedValue(rows)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, rows)
    expect(json).toBeCalledWith({ data })
  })
})
