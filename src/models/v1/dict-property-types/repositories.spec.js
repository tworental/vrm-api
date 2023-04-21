const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('dict-property-types repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'dict_property_types' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
