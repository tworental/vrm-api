const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectBookingGuests } = require('../../../../../models/v1/booking-guests/repositories')
const {
  selectBy: selectBookingExtrasBy,
  sumTotalExtras,
} = require('../../../../../models/v1/booking-extras/repositories')
const { bookingDetails } = require('../../../../../models/v1/bookings/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/bookings/serializers')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/booking-guests/repositories')
jest.mock('../../../../../models/v1/booking-extras/repositories')
jest.mock('../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../models/v1/bookings/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/bookings/:id', () => {
  const cacheKey = 'cacheKey'

  const id = 'id'
  const accountId = 'accountId'

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const booking = 'booking'
    const guest = 'guest'
    const totalServices = 200
    const totalFees = 250
    const totalTaxes = 700

    const data = 'data'

    const json = jest.fn().mockImplementation((args) => args)

    bookingDetails.mockResolvedValue(booking)
    selectBookingGuests.mockResolvedValue([guest])
    selectBookingExtrasBy.mockResolvedValue([
      { id: 1, extrasType: 'fee', totalAmountExchanged: 100 },
      { id: 2, extrasType: 'fee', totalAmountExchanged: 150 },
      { id: 3, extrasType: 'tax', totalAmountExchanged: 500 },
      { id: 4, extrasType: 'tax', totalAmountExchanged: 200 },
      { id: 5, extrasType: 'service', totalAmountExchanged: 100 },
      { id: 6, extrasType: 'service', totalAmountExchanged: 100 },
    ])
    sumTotalExtras.mockImplementation((array) => array.reduce((acc, curr) => acc + curr.totalAmountExchanged, 0))
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toHaveBeenNthCalledWith(1, 'accounts.%s.bookings.show.%s', accountId, id)
    expect(cache.key).toHaveBeenNthCalledWith(2, 'accounts.%s.bookings.show.%s.guests', accountId, id)
    expect(cache.key).toHaveBeenNthCalledWith(3, 'accounts.%s.bookings.show.%s.extras', accountId, id)
    expect(bookingDetails).toBeCalledWith({ id, accountId })
    expect(selectBookingGuests).toBeCalledWith(id)
    expect(selectBookingExtrasBy).toBeCalledWith({ bookingId: id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, booking, {
      guest,
      totalServices,
      totalFees,
      totalTaxes,
    })
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if owner does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    bookingDetails.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(cache.wrap).toBeCalledWith(cacheKey, expect.any(Function))
    expect(cache.key).toBeCalledWith('accounts.%s.bookings.show.%s', accountId, id)
    expect(bookingDetails).toBeCalledWith({ id, accountId })
    expect(selectBookingGuests).not.toBeCalled()
    expect(serialize).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
