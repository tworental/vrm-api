const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('properties repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'properties',
      softDelete: true,
      jsonFields: ['languages', 'address', 'coordinates', 'distances'],
      methods: {
        completenessDetails: expect.any(Function),
        isPropertyCompleted: expect.any(Function),
        updateCompletenessStatus: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
