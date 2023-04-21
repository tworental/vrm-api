const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('owner-reports repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'owner_reports',
      storageDir: 'reports',
      methods: {
        generateReport: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
