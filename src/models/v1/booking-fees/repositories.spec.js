const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('booking-fees repositories', () => {
  it('should initialize a DAO', async () => {
    const model = { tableName: 'booking_fees' }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
