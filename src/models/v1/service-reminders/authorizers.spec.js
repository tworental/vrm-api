const { checkModule, checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')

jest.mock('../../../services/authorizers')
jest.mock('./repositories')

const authorizer = require('./authorizers')

describe('service-reminders authorizers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check a qouta authorizer', async () => {
    const req = { user: { accountId: 1000 } }
    const results = 'results'

    const where = jest.fn().mockResolvedValue(results)
    const join = jest.fn().mockReturnValue({ where })

    selectBy.mockReturnValue({ join })

    await expect(authorizer.quota[1](req))
      .resolves.toEqual(results)

    expect(checkQuota).toBeCalled()
    expect(selectBy).toBeCalled()
    expect(join).toBeCalledWith('services', 'services.id', 'service_reminders.service_id')
    expect(where).toBeCalledWith({ accountId: req.user.accountId })
    expect(authorizer.quota).toEqual(['account.module.services.reminders.limit', expect.any(Function)])
  })

  it('should have a proper authorizer data', () => {
    expect(authorizer.module).toEqual([
      'account.module.services.reminders.enabled', checkModule,
    ])
  })
})
