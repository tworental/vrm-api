const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { selectOneBy: selectBookingBy } = require('../../../../../../models/v1/bookings/repositories')
const { selectBy: selectBookingGuestsBy } = require('../../../../../../models/v1/booking-guests/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../../models/v1/booking-guests/serializers')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-guests/repositories')
jest.mock('../../../../../../models/v1/booking-guests/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/bookings/:bookingId/guests', () => {
  const accountId = 1
  const bookingId = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const data = [
      { id: 1 },
    ]

    const json = jest.fn().mockImplementation((args) => args)

    selectBookingBy.mockResolvedValue(true)
    selectBookingGuestsBy.mockResolvedValue(data)

    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { bookingId } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingGuestsBy).toBeCalledWith({ bookingId })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectBookingBy.mockResolvedValue(false)

    await expect(httpHandler({ user: { accountId }, params: { bookingId } }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
  })
})
