const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectBy: selectBookingPaymentsBy } = require('../../../../../../models/v1/booking-payments/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/booking-payments/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-payments/repositories')
jest.mock('../../../../../../models/v1/booking-payments/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/bookings/:bookingId/payments', () => {
  const accountId = 'accountId'
  const bookingId = 'bookingId'

  it('should display all resources', async () => {
    const data = [
      { id: 1 },
    ]

    const json = jest.fn().mockImplementation((args) => args)

    selectBookingBy.mockResolvedValue(true)
    selectBookingPaymentsBy.mockResolvedValue(data)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { bookingId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentsBy).toBeCalledWith({ bookingId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error for not existed booking', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(false)

    await expect(httpHandler({ user: { accountId }, params: { bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
