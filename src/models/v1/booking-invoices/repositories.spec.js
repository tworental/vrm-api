const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('booking-invoices repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'booking_invoices',
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
