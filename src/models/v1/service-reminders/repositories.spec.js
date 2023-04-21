const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('service-reminders repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'service_reminders' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
