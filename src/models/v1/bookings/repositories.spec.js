const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('bookings repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'bookings',
      methods: {
        calculateTotalAmount: expect.any(Function),
        calculateOccupancy: expect.any(Function),
        filterBookings: expect.any(Function),
        bookingDetails: expect.any(Function),
        changeBookingStatus: expect.any(Function),
        generateInvoice: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
