const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('property-customer-contacts repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_customer_contacts',
      methods: {
        withCustomerContacts: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
