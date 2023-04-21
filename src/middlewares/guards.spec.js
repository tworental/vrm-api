const createError = require('../services/errors')
const cache = require('../services/cacheManager')
const { parseToken, authByUserJwt, authByOwnerJwt } = require('../services/auth')
const { selectOneBy: selectAccountBy } = require('../models/v1/accounts/repositories')
const { selectOneBy: selectUserBy } = require('../models/v1/users/repositories')
const { selectOneBy: selectOwnerBy } = require('../models/v1/owners/repositories')
const { selectOneBy: selectAccountSettingsBy } = require('../models/v1/account-settings/repositories')
const { selectOneBy: selectUserSettingsBy } = require('../models/v1/user-settings/repositories')
const { selectOneBy: selectOwnerSettingsBy } = require('../models/v1/owner-settings/repositories')
const { selectLimits } = require('../models/v1/limits/repositories')

jest.mock('../services/errors')
jest.mock('../services/cacheManager')
jest.mock('../services/auth')
jest.mock('../models/v1/accounts/repositories')
jest.mock('../models/v1/users/repositories')
jest.mock('../models/v1/owners/repositories')
jest.mock('../models/v1/account-settings/repositories')
jest.mock('../models/v1/user-settings/repositories')
jest.mock('../models/v1/owner-settings/repositories')
jest.mock('../models/v1/limits/repositories')

const middleware = require('./guards')

describe('guards middleware', () => {
  const token = 'TOKEN'

  const req = {
    method: 'POST',
    query: {},
    headers: {
      authorization: `Bearer ${token}`,
    },
  }

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('jwtUserGuard', () => {
    it('should guard allow access to user', async () => {
      const auth = {
        sub: '20',
        iss: 'luxor',
        jti: 10000,
      }

      const limits = 'limits'
      const settings = 'settings'
      const accountSettings = 'accountSettings'
      const user = { id: 5 }
      const account = { id: 1, packageId: 100 }

      const next = jest.fn()
      const whereNotNull = jest.fn().mockResolvedValue(user)
      const whereNull = jest.fn().mockReturnValue({ whereNotNull })

      parseToken.mockResolvedValue(token)
      authByUserJwt.mockResolvedValue(auth)
      selectAccountBy.mockResolvedValue(account)
      selectLimits.mockResolvedValue(limits)
      selectUserBy.mockReturnValue({ whereNull })
      selectUserSettingsBy.mockResolvedValue(settings)
      selectAccountSettingsBy.mockResolvedValue(accountSettings)

      await expect(middleware.jwtUserGuard(req, {}, next))
        .resolves.toBeUndefined()

      expect(cache.wrap).toBeCalledWith('accounts.luxor.10000', expect.any(Function))
      expect(cache.wrap).toBeCalledWith('accounts.1.limits', expect.any(Function))
      expect(cache.wrap).toBeCalledWith('accounts.1.users.20', expect.any(Function))
      expect(cache.wrap).toBeCalledWith('accounts.1.users.20.settings', expect.any(Function))
      expect(cache.wrap).toBeCalledWith('accounts.1.settings', expect.any(Function))

      expect(parseToken).toBeCalledWith(req)
      expect(authByUserJwt).toBeCalledWith(token)
      expect(selectAccountBy).toBeCalledWith({ identifier: auth.iss })
      expect(selectLimits).toBeCalledWith({
        accountId: account.id,
        packageId: account.packageId,
      })
      expect(selectUserBy).toBeCalledWith({ id: auth.sub, accountId: account.id })
      expect(whereNull).toBeCalledWith('lockedAt')
      expect(whereNotNull).toBeCalledWith('confirmedAt')
      expect(selectUserSettingsBy).toBeCalledWith({ userId: user.id })
      expect(selectAccountSettingsBy).toBeCalledWith({ accountId: account.id })
      expect(next).toBeCalled()
    })

    it('should throw an error if account does not exists', async () => {
      const errorMessage = 'Invalid Credentials'

      const auth = {
        sub: 'sub',
        iss: 'iss',
      }

      const next = jest.fn().mockImplementation((args) => args)

      createError.mockReturnValue(errorMessage)

      parseToken.mockResolvedValue(token)
      authByUserJwt.mockResolvedValue(auth)
      selectAccountBy.mockResolvedValue(null)

      await expect(middleware.jwtUserGuard(req, {}, next))
        .resolves.toEqual(errorMessage)

      expect(parseToken).toBeCalledWith(req)
      expect(authByUserJwt).toBeCalledWith(token)
      expect(selectAccountBy).toBeCalledWith({ identifier: auth.iss })
      expect(selectLimits).not.toBeCalled()
      expect(createError).toBeCalledWith(401, 'Missing or malformed token')
      expect(next).toBeCalledWith(errorMessage)
    })

    it('should throw an error if account does not exists', async () => {
      const errorMessage = 'Invalid Credentials'

      const auth = {
        sub: 'sub',
        iss: 'iss',
      }

      const next = jest.fn().mockImplementation((args) => args)

      createError.mockReturnValue(errorMessage)

      const limits = 'limits'
      const account = { id: 1, packageId: 100 }
      const whereNotNull = jest.fn().mockResolvedValue(null)
      const whereNull = jest.fn().mockReturnValue({ whereNotNull })

      parseToken.mockResolvedValue(token)
      authByUserJwt.mockResolvedValue(auth)
      selectAccountBy.mockResolvedValue(account)
      selectLimits.mockResolvedValue(limits)
      selectUserBy.mockReturnValue({ whereNull })

      await expect(middleware.jwtUserGuard(req, {}, next))
        .resolves.toEqual(errorMessage)

      expect(parseToken).toBeCalledWith(req)
      expect(authByUserJwt).toBeCalledWith(token)
      expect(selectAccountBy).toBeCalledWith({ identifier: auth.iss })
      expect(selectLimits).toBeCalledWith({
        accountId: account.id,
        packageId: account.packageId,
      })
      expect(selectUserBy).toBeCalledWith({ id: auth.sub, accountId: account.id })
      expect(whereNull).toBeCalledWith('lockedAt')
      expect(whereNotNull).toBeCalledWith('confirmedAt')
      expect(selectUserSettingsBy).not.toBeCalled()
      expect(createError).toBeCalledWith(401, 'Missing or malformed token')
      expect(next).toBeCalledWith(errorMessage)
    })

    it('should fail when an error appear', async () => {
      const error = new Error('error')
      const next = jest.fn()

      parseToken.mockResolvedValue(token)
      authByUserJwt.mockRejectedValue(error)

      await expect(middleware.jwtUserGuard(req, {}, next))
        .resolves.toBeUndefined()

      expect(selectAccountBy).not.toBeCalled()
      expect(selectLimits).not.toBeCalled()
      expect(next).toBeCalledWith(error)
    })
  })

  describe('jwtOwnerGuard', () => {
    it('should guard allow access to owner', async () => {
      const auth = {
        sub: 'sub',
        iss: 'iss',
      }

      const limits = 'limits'
      const settings = 'settings'
      const accountSettings = 'accountSettings'
      const owner = { id: 5 }
      const account = { id: 1, packageId: 100 }

      const next = jest.fn()
      const whereNotNull = jest.fn().mockResolvedValue(owner)
      const whereNull = jest.fn().mockReturnValue({ whereNotNull })

      parseToken.mockResolvedValue(token)
      authByOwnerJwt.mockResolvedValue(auth)
      selectAccountBy.mockResolvedValue(account)
      selectLimits.mockResolvedValue(limits)
      selectOwnerBy.mockReturnValue({ whereNull })
      selectOwnerSettingsBy.mockResolvedValue(settings)
      selectAccountSettingsBy.mockResolvedValue(accountSettings)

      await expect(middleware.jwtOwnerGuard(req, {}, next))
        .resolves.toBeUndefined()

      expect(parseToken).toBeCalledWith(req)
      expect(authByOwnerJwt).toBeCalledWith(token)
      expect(selectAccountBy).toBeCalledWith({ identifier: auth.iss })
      expect(selectLimits).toBeCalledWith({
        accountId: account.id,
        packageId: account.packageId,
      })
      expect(selectOwnerBy).toBeCalledWith({ id: auth.sub, accountId: account.id, hasPanelAccess: 1 })
      expect(whereNull).toBeCalledWith('lockedAt')
      expect(whereNotNull).toBeCalledWith('confirmedAt')
      expect(selectOwnerSettingsBy).toBeCalledWith({ ownerId: owner.id })
      expect(selectAccountSettingsBy).toBeCalledWith({ accountId: account.id })
      expect(next).toBeCalled()
    })

    it('should throw an error if account does not exists', async () => {
      const errorMessage = 'Invalid Credentials'

      const auth = {
        sub: 'sub',
        iss: 'iss',
      }

      const next = jest.fn().mockImplementation((args) => args)

      createError.mockReturnValue(errorMessage)

      parseToken.mockResolvedValue(token)
      authByOwnerJwt.mockResolvedValue(auth)
      selectAccountBy.mockResolvedValue(null)

      await expect(middleware.jwtOwnerGuard(req, {}, next))
        .resolves.toEqual(errorMessage)

      expect(parseToken).toBeCalledWith(req)
      expect(authByOwnerJwt).toBeCalledWith(token)
      expect(selectAccountBy).toBeCalledWith({ identifier: auth.iss })
      expect(selectLimits).not.toBeCalled()
      expect(createError).toBeCalledWith(401, 'Missing or malformed token')
      expect(next).toBeCalledWith(errorMessage)
    })

    it('should throw an error if account does not exists', async () => {
      const errorMessage = 'Invalid Credentials'

      const auth = {
        sub: 'sub',
        iss: 'iss',
      }

      const next = jest.fn().mockImplementation((args) => args)

      createError.mockReturnValue(errorMessage)

      const limits = 'limits'
      const account = { id: 1, packageId: 100 }
      const whereNotNull = jest.fn().mockResolvedValue(null)
      const whereNull = jest.fn().mockReturnValue({ whereNotNull })

      parseToken.mockResolvedValue(token)
      authByOwnerJwt.mockResolvedValue(auth)
      selectAccountBy.mockResolvedValue(account)
      selectLimits.mockResolvedValue(limits)
      selectOwnerBy.mockReturnValue({ whereNull })

      await expect(middleware.jwtOwnerGuard(req, {}, next))
        .resolves.toEqual(errorMessage)

      expect(parseToken).toBeCalledWith(req)
      expect(authByOwnerJwt).toBeCalledWith(token)
      expect(selectAccountBy).toBeCalledWith({ identifier: auth.iss })
      expect(selectLimits).toBeCalledWith({
        accountId: account.id,
        packageId: account.packageId,
      })
      expect(selectOwnerBy).toBeCalledWith({ id: auth.sub, accountId: account.id, hasPanelAccess: 1 })
      expect(whereNull).toBeCalledWith('lockedAt')
      expect(whereNotNull).toBeCalledWith('confirmedAt')
      expect(selectOwnerSettingsBy).not.toBeCalled()
      expect(createError).toBeCalledWith(401, 'Missing or malformed token')
      expect(next).toBeCalledWith(errorMessage)
    })

    it('should fail when an error appear', async () => {
      const error = new Error('error')
      const next = jest.fn()

      parseToken.mockResolvedValue(token)
      authByOwnerJwt.mockRejectedValue(error)

      await expect(middleware.jwtOwnerGuard(req, {}, next))
        .resolves.toBeUndefined()

      expect(selectAccountBy).not.toBeCalled()
      expect(selectLimits).not.toBeCalled()
      expect(next).toBeCalledWith(error)
    })
  })
})
