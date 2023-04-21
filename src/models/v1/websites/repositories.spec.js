const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('websites repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'websites', storageDir: 'websites' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
