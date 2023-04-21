const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('channel-manager-accounts repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'channel_manager_accounts' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
