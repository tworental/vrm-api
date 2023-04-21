const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('companies repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'companies',
      jsonFields: ['labels'],
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
