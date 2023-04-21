const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/permissions/repositories')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/permissions/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/permissions', () => {
  it('should display all resources', async () => {
    const user = { accountId: 1 }
    const query = {}
    const data = 'data'

    const json = jest.fn().mockImplementation((args) => args)

    cache.wrap.mockImplementation((key, fn) => fn())
    selectBy.mockResolvedValue(data)

    await expect(httpHandler({ user, query }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(`accounts.${user.accountId}.users.premissions`, expect.any(Function))
    expect(selectBy).toBeCalledWith({ accountId: 1, userId: null })
    expect(json).toBeCalledWith({ data })
  })
})
