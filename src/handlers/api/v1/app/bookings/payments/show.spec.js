const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectOneBy: selectBookingPaymentBy } = require('../../../../../../models/v1/booking-payments/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/booking-payments/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-payments/repositories')
jest.mock('../../../../../../models/v1/booking-payments/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/bookings/:bookingId/payments/:id', () => {
  const accountId = 'accountId'
  const bookingId = 'bookingId'
  const id = 'id'

  it('should display a resource', async () => {
    const data = { id }

    const json = jest.fn().mockImplementation((args) => args)

    selectBookingBy.mockResolvedValue(true)
    selectBookingPaymentBy.mockResolvedValue(data)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error for not existed booking', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(false)

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error for not existed booking payment', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(true)
    selectBookingPaymentBy.mockResolvedValue(null)
    serialize.mockReturnValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, null)
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
