const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('account-settings repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'account_settings' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
