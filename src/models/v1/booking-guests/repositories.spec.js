const dao = require('../../../services/dao')

jest.mock('../../../services/dao')

const repository = require('./repositories')

describe('booking-guests repositories', () => {
  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'booking_guests',
      methods: {
        selectBookingGuests: expect.any(Function),
      },
    }

    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })
})
