const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('dict-services repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'dict_fees' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
