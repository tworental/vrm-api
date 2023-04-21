const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('agents repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'account_contacts',
      jsonFields: ['parlance'],
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
