const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingGuestBy,
  deleteBy: deleteBookingGuestBy,
} = require('../../../../../../models/v1/booking-guests/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-guests/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/bookings/:bookingId/guests/:id', () => {
  const id = 1
  const accountId = 1
  const bookingId = 1
  const trx = 'trx'

  it('should delete a resource', async () => {
    const results = 204
    const booking = 'booking'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectBookingBy.mockResolvedValue(booking)
    selectBookingGuestBy.mockResolvedValue(true)

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingGuestBy).toBeCalledWith({ id, bookingId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(deleteBookingGuestBy).toBeCalledWith({ id, bookingId })
    expect(changeBookingStatus).toBeCalledWith(booking, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(results)
  })

  it('should throw not found error for booking guest', async () => {
    const errorMessage = 'Not Found'
    const booking = 'booking'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(booking)
    selectBookingGuestBy.mockResolvedValue(false)

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingGuestBy).toBeCalledWith({ id, bookingId })
  })

  it('should throw not found error for booking', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(null)

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
  })
})
