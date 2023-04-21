const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('property-taxes repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_taxes',
      methods: {
        withTaxes: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
