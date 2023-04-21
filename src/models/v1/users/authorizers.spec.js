const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')

jest.mock('../../../services/authorizers')
jest.mock('./repositories')

const authorizer = require('./authorizers')

describe('users authorizers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check a qouta authorizer', async () => {
    const req = { user: { id: 1, accountId: 1000 } }
    const results = 'results'

    const where = jest.fn().mockResolvedValue(results)

    selectBy.mockReturnValue({ where })

    await expect(authorizer.quota[1](req))
      .resolves.toEqual(results)

    expect(checkQuota).toBeCalled()
    expect(selectBy).toBeCalledWith({ accountId: req.user.accountId })
    expect(where).toBeCalledWith('id', '!=', req.user.id)
    expect(authorizer.quota).toEqual(['account.module.team.limit', expect.any(Function)])
  })

  it('should have a proper authorizer data', () => {
    expect(authorizer.module).toEqual([
      'account.module.team.enabled', checkModule,
    ])
  })
})
