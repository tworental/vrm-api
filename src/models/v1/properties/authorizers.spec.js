const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')

jest.mock('../../../services/authorizers')
jest.mock('./repositories')

const authorizer = require('./authorizers')

describe('properties authorizers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check a qouta authorizer', async () => {
    const req = { user: { accountId: 1000 } }
    const results = 'results'

    selectBy.mockResolvedValue(results)

    await expect(authorizer.quota[1](req))
      .resolves.toEqual(results)

    expect(checkQuota).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId: req.user.accountId })
    expect(authorizer.quota).toEqual(['account.module.properties.limit', expect.any(Function)])
  })

  it('should have a proper authorizer data', () => {
    expect(authorizer.module).toEqual([
      'account.module.properties.enabled', checkModule,
    ])
  })
})
