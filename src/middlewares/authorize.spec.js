const createError = require('../services/errors')
const cache = require('../services/cacheManager')
const { selectBy } = require('../models/v1/permissions/repositories')

jest.mock('../services/errors')
jest.mock('../services/cacheManager')
jest.mock('../models/v1/permissions/repositories')

const authorize = require('./authorize')

describe('authorize middleware', () => {
  const resource = 'users:read'
  const req = {
    user: { isAccountOwner: null },
    auth: { sub: 1000 },
    account: { id: 1 },
  }

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should allow access', async () => {
    const permissions = [{ name: 'users', abilities: ['read'] }]

    const next = jest.fn()

    selectBy.mockResolvedValue(permissions)

    await expect(authorize(resource)(req, {}, next)).resolves.toBeUndefined()

    expect(cache.wrap).toBeCalledWith(`accounts.${req.account.id}.${req.auth.sub}.permissions`, expect.any(Function))
    expect(selectBy).toBeCalledWith({ userId: req.auth.sub, accountId: req.account.id })
    expect(next).toBeCalled()
  })

  it('should allow guest user without checking permission', async () => {
    const next = jest.fn()

    await expect(authorize(resource)({ user: null }, {}, next)).resolves.toBeUndefined()

    expect(selectBy).not.toBeCalled()
    expect(next).toBeCalled()
  })

  it('should allow user without checking permission if he is owner', async () => {
    const next = jest.fn()

    await expect(authorize(resource)({ user: { isAccountOwner: 'yes' } }, {}, next)).resolves.toBeUndefined()

    expect(selectBy).not.toBeCalled()
    expect(next).toBeCalled()
  })

  it('should check that the object has the specified properties', async () => {
    const permissions = [{ name: '' }]

    const next = jest.fn()

    selectBy.mockResolvedValue(permissions)

    await expect(authorize(resource)(req, {}, next)).resolves.toBeUndefined()

    expect(cache.wrap).toBeCalledWith(`accounts.${req.account.id}.${req.auth.sub}.permissions`, expect.any(Function))
    expect(selectBy).toBeCalledWith({ userId: req.auth.sub, accountId: req.account.id })
    expect(next).toBeCalled()
  })

  it('should thrown an error when user does not have privileges', async () => {
    const errorMessage = 'Access Denied'
    const permissions = [{ name: 'users', abilities: [''] }]

    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)

    selectBy.mockResolvedValue(permissions)

    await expect(authorize(resource)(req, {}, next)).resolves.toEqual(errorMessage)

    expect(cache.wrap).toBeCalledWith(`accounts.${req.account.id}.${req.auth.sub}.permissions`, expect.any(Function))
    expect(selectBy).toBeCalledWith({ userId: req.auth.sub, accountId: req.account.id })
    expect(createError).toBeCalledWith(403, errorMessage)
    expect(next).toBeCalledWith(errorMessage)
  })
})
