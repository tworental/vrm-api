const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('owner-settings repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'owner_settings',
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
