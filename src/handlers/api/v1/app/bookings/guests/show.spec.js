const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectOneBy: selectBookingGuestBy } = require('../../../../../../models/v1/booking-guests/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../../models/v1/booking-guests/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-guests/repositories')
jest.mock('../../../../../../models/v1/booking-guests/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/bookings/:bookingId/guests/:id', () => {
  const id = 1
  const accountId = 1
  const bookingId = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display a resource', async () => {
    const data = { id }

    const json = jest.fn().mockImplementation((args) => args)

    selectBookingBy.mockResolvedValue(true)
    selectBookingGuestBy.mockResolvedValue(data)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingGuestBy).toBeCalledWith({ id, bookingId })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error for not found booking guest', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(true)
    selectBookingGuestBy.mockResolvedValue(false)

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingGuestBy).toBeCalledWith({ id, bookingId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error for not found booking', async () => {
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
})
