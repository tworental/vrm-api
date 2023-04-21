const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('services repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'services' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
