const { checkModule, checkQuota } = require('../../../services/authorizers')
const { sum } = require('./files/repositories')

jest.mock('../../../services/authorizers')
jest.mock('./files/repositories')

const authorizer = require('./authorizers')

describe('storage authorizers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check a qouta authorizer', async () => {
    const req = { user: { accountId: 1000 } }
    const results = 'results'

    sum.mockResolvedValue(results)

    await expect(authorizer.quota[1](req))
      .resolves.toEqual(results)

    expect(checkQuota).toBeCalled()
    expect(sum).toBeCalledWith('size', { accountId: req.user.accountId })
    expect(authorizer.quota).toEqual(['account.module.storage.quota', expect.any(Function)])
  })

  it('should have a proper authorizer data', () => {
    expect(authorizer.module).toEqual([
      'account.module.storage.enabled', checkModule,
    ])
  })
})
