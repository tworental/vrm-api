const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('customer-contacts repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'customer_contacts',
      jsonFields: ['parlance'],
      storageDir: 'customer-contacts',
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
