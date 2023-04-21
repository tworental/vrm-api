const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('packages repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'packages' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
