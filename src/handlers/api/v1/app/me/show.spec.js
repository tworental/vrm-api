const cache = require('../../../../../services/cacheManager')
const { handler } = require('../../../../../services/http')
const { selectBy } = require('../../../../../models/v1/permissions/repositories')
const { serialize } = require('../../../../../models/v1/users/serializers')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/permissions/repositories')
jest.mock('../../../../../models/v1/users/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/me', () => {
  const data = 'data'

  const permissions = [
    { name: 'users', abilities: ['read'] },
  ]

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
  })

  it('should show a resource', async () => {
    const user = {
      id: 100, accountId: 1, isAccountOwner: 1, email: 'email',
    }

    const json = jest.fn().mockImplementation((args) => args)

    selectBy.mockResolvedValue(permissions)
    serialize.mockResolvedValue(data)

    await expect(httpHandler({ user }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith('accounts.1.users.100.premissions', expect.any(Function))
    expect(selectBy).toBeCalledWith({ accountId: user.accountId, userId: user.id })
    expect(serialize).toBeCalledWith(user, { permissions: { users: ['read', 'write', 'delete'] } })
    expect(json).toBeCalledWith({ data })
  })

  it('should show a resource', async () => {
    const user = {
      id: 100, accountId: 1, isAccountOwner: 0, email: 'email',
    }

    const json = jest.fn().mockImplementation((args) => args)

    selectBy.mockResolvedValue(permissions)
    serialize.mockResolvedValue(data)

    selectBy.mockResolvedValue(permissions)
    serialize.mockResolvedValue(data)

    await expect(httpHandler({ user }, { json })).resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId: user.accountId, userId: user.id })
    expect(serialize).toBeCalledWith(user, { permissions: { users: ['read'] } })
    expect(json).toBeCalledWith({ data })
  })
})
