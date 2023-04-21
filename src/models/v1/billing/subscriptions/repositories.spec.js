const dao = require('../../../../services/dao')

jest.mock('../../../../services/dao')

const repository = require('./repositories')

describe('subscriptions repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'billing_subscriptions' }
    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
