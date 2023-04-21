const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('owner-report-items repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'owner_report_items',
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
