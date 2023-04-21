const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('integration-accounts repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'integration_accounts',
      jsonFields: ['settings'],
      methods: {
        withIntegration: expect.any(Function),
        upsertGuestToMailchimp: expect.any(Function),
        deleteMailchimpGuest: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
