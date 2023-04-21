const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingPaymentBy,
  deleteBy: deleteBookingPaymentBy,
  sum: sumBookingPayment,
} = require('../../../../../../models/v1/booking-payments/repositories')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-payments/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/bookings/:bookingId/payments/:id', () => {
  const id = 1
  const accountId = 1
  const bookingId = 1
  const trx = 'trx'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const results = 204
    const booking = { id: bookingId }
    const amountTotalPaid = 1000

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectBookingBy.mockResolvedValue(booking)
    selectBookingPaymentBy.mockResolvedValue(true)

    createTransaction.mockImplementation((fn) => fn(trx))

    sumBookingPayment.mockResolvedValue({ sum: amountTotalPaid })

    await expect(httpHandler({ user: { accountId }, params: { bookingId, id } }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(sendStatus).toBeCalledWith(results)
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(deleteBookingPaymentBy).toBeCalledWith({ id }, trx)
    expect(sumBookingPayment).toBeCalledWith('amount_exchanged', { bookingId }, trx)
    expect(updateBookingBy).toBeCalledWith({ id: bookingId }, { amountTotalPaid }, trx)
    expect(changeBookingStatus).toBeCalledWith({ ...booking, amountTotalPaid }, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
  })

  it('should throw not found error for not found booking payments', async () => {
    const errorMessage = 'Not Found'
    const booking = { id: bookingId }

    selectBookingBy.mockResolvedValue(booking)

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ user: { accountId }, params: { bookingId, id } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
  })

  it('should throw not found error for not found booking', async () => {
    const errorMessage = 'Not Found'

    selectBookingBy.mockResolvedValue(null)

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ user: { accountId }, params: { bookingId, id } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
  })
})
