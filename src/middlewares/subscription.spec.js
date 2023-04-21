const createError = require('../services/errors')
const cache = require('../services/cacheManager')
const { selectOneBy } = require('../models/v1/billing/subscriptions/repositories')

jest.mock('../services/errors')
jest.mock('../services/cacheManager')
jest.mock('../models/v1/billing/subscriptions/repositories')

const checkSubscription = require('./subscription')

describe('subscription middleware', () => {
  const id = 1000
  const trialExpirationOn = 1479427200000

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
    jest.spyOn(Date, 'now').mockImplementation(() => trialExpirationOn)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check if subscription is active', async () => {
    const next = jest.fn()

    selectOneBy.mockResolvedValue(id)

    await expect(checkSubscription({ account: { id, trialExpirationOn } }, {}, next))
      .resolves.toBeUndefined()

    expect(cache.wrap).toBeCalledWith(`accounts.${id}.subscriptions.active`, expect.any(Function))
    expect(selectOneBy).toBeCalledWith({ accountId: id, status: 'active' })
    expect(next).toBeCalled()
  })

  it('should throw an error if account is expired', async () => {
    const errorMessage = 'Account Expired'

    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)
    selectOneBy.mockResolvedValue(null)

    await expect(checkSubscription({ account: { id, trialExpirationOn } }, {}, next))
      .resolves.toEqual(errorMessage)

    expect(cache.wrap).toBeCalledWith(`accounts.${id}.subscriptions.active`, expect.any(Function))
    expect(selectOneBy).toBeCalledWith({ accountId: id, status: 'active' })
    expect(createError).toBeCalledWith(402, errorMessage)
    expect(next).toBeCalledWith(errorMessage)
  })

  it('should check if expiration date is not exceeded', async () => {
    const next = jest.fn()

    selectOneBy.mockResolvedValue(null)

    await expect(checkSubscription({ account: { id, trialExpirationOn: 2509427200000 } }, {}, next))
      .resolves.toBeUndefined()

    expect(cache.wrap).toBeCalledWith(`accounts.${id}.subscriptions.active`, expect.any(Function))
    expect(selectOneBy).toBeCalledWith({ accountId: id, status: 'active' })
    expect(next).toBeCalled()
  })

  it('should check if expiration date is not set', async () => {
    const next = jest.fn()

    selectOneBy.mockResolvedValue(null)

    await expect(checkSubscription({ account: { id, trialExpirationOn: null } }, {}, next))
      .resolves.toBeUndefined()

    expect(cache.wrap).toBeCalledWith(`accounts.${id}.subscriptions.active`, expect.any(Function))
    expect(selectOneBy).toBeCalledWith({ accountId: id, status: 'active' })
    expect(next).toBeCalled()
  })

  it('should fail when an error occurs', async () => {
    const error = new Error('error')
    const next = jest.fn()

    selectOneBy.mockRejectedValue(error)

    await expect(checkSubscription({ account: { id, trialExpirationOn } }, {}, next))
      .resolves.toBeUndefined()

    expect(next).toBeCalledWith(error)
  })
})
