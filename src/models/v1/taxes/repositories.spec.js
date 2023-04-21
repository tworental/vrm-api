const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('taxes repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'taxes',
      methods: {
        getLogicType: expect.any(Function),
        getTaxOptionsByChannexPriceMode: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
