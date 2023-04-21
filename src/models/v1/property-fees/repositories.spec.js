const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('property-fees repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_fees',
      methods: {
        withFees: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
