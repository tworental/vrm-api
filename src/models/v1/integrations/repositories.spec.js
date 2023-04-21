const dao = require('../../../services/dao')
const { raw } = require('../../../services/database')

jest.mock('../../../services/dao')
jest.mock('../../../services/database')

const repository = require('./repositories')

describe('integrations repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'integrations',
      methods: {
        withAccount: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('withAccount', () => {
    it('should add account queries', () => {
      const accountId = 'accountId'

      const onAccountBuilder = jest.fn()
      const onIntegrationBuilder = jest.fn().mockReturnValue({ on: onAccountBuilder })
      const builder = { on: onIntegrationBuilder }
      const where = jest.fn()
      const select = jest.fn().mockReturnValue({ where })
      const clearSelect = jest.fn().mockReturnValue({ select })

      const leftJoin = jest.fn().mockImplementation((name, fn) => {
        fn(builder)
        return { clearSelect }
      })
      const queryBuilder = { leftJoin }
      raw.mockReturnValue('IFNULL(integration_accounts.enabled, false) AS enabled')

      repository.methods.withAccount(accountId)(queryBuilder)

      expect(leftJoin).toBeCalledWith('integration_accounts', expect.any(Function))
      expect(onIntegrationBuilder).toBeCalledWith('integrations.id', 'integration_accounts.integration_id')
      expect(onAccountBuilder).toBeCalledWith('account_id', 'accountId')
      expect(clearSelect).toBeCalled()
      expect(clearSelect).toBeCalled()
      expect(select).toBeCalledWith([
        'integrations.*',
        'IFNULL(integration_accounts.enabled, false) AS enabled',
      ])
      expect(raw).toBeCalledWith('IFNULL(integration_accounts.enabled, false) AS enabled')
      expect(where).toBeCalledWith('integrations.enabled', '=', 1)
    })
  })
})
