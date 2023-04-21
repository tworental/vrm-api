const { raw } = require('../../../services/database')
const dao = require('../../../services/dao')

jest.mock('../../../services/database')
jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('channel-managers repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'channel_managers',
      methods: {
        withAccount: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  describe('withAccount', () => {
    it('should mutate queryBuilder', () => {
      const accountId = 1

      raw.mockReturnValueOnce('IFNULL(channel_manager_accounts.enabled, false) AS enabled')

      const where = jest.fn()
      const select = jest.fn().mockReturnValue({ where })
      const clearSelect = jest.fn().mockReturnValue({ select })

      const onAccount = jest.fn()
      const onBuild = jest.fn().mockReturnValue({ on: onAccount })
      const builder = { on: onBuild }

      const leftJoin = jest.fn().mockImplementation((tableName, fn) => {
        fn(builder)
        return { clearSelect }
      })

      const queryBuilder = { leftJoin }

      repository.methods.withAccount(accountId)(queryBuilder)

      expect(leftJoin).toBeCalledWith('channel_manager_accounts', expect.any(Function))
      expect(onBuild).toBeCalledWith('channel_managers.id', 'channel_manager_accounts.channel_manager_id')
      expect(onAccount).toBeCalledWith('account_id', accountId)
      expect(clearSelect).toBeCalled()
      expect(select).toBeCalledWith([
        'channel_managers.*',
        'IFNULL(channel_manager_accounts.enabled, false) AS enabled',
      ])
      expect(where).toBeCalledWith('channel_managers.enabled', '=', 1)
    })
  })
})
