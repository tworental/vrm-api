const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { amountByCurrency } = require('../../../../../../models/v1/dict-currency-rates/repositories')
const {
  selectOneBy: selectBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  selectOneBy: selectBookingPaymentBy,
  updateBy: updateBookingPaymentBy,
} = require('../../../../../../models/v1/booking-payments/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/booking-payments/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/dict-currency-rates/repositories')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-payments/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/bookings/:bookingId/payments/:id', () => {
  const id = 1
  const accountId = 1
  const bookingId = 1
  const trx = 'trx'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource for different currencies', async () => {
    const results = 200
    const body = { currency: 'EUR' }
    const booking = { id: bookingId, currency: 'USD' }
    const bookingPayment = { amount: 1000, currency: 'EUR' }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(body)
    selectBookingBy.mockResolvedValue(booking)
    selectBookingPaymentBy.mockResolvedValue(bookingPayment)

    const currencyRateFn = jest.fn().mockReturnValue(1.5)
    amountByCurrency.mockResolvedValue(currencyRateFn)

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId }, body }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(sendStatus).toBeCalledWith(results)
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
    expect(amountByCurrency).toBeCalledWith(booking.currency)
    expect(currencyRateFn).toBeCalledWith(1000, 'EUR')
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBookingPaymentBy).toBeCalledWith({ id }, body)
    expect(changeBookingStatus).toBeCalledWith(booking, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
  })

  it('should update a resource for the same currencies', async () => {
    const results = 200
    const body = {}
    const booking = { id: bookingId, currency: 'EUR' }
    const bookingPayment = { amount: 1000, currency: 'EUR' }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(body)
    selectBookingBy.mockResolvedValue(booking)
    selectBookingPaymentBy.mockResolvedValue(bookingPayment)

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId }, body }, { sendStatus }))
      .resolves.toEqual(results)

    expect(sendStatus).toBeCalledWith(results)
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBookingPaymentBy).toBeCalledWith({ id }, body)
    expect(changeBookingStatus).toBeCalledWith(booking, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
  })

  it('should update a resource for provided currencyRate', async () => {
    const results = 200
    const body = { currencyRate: 1 }
    const booking = { id: bookingId, currency: 'EUR' }
    const bookingPayment = { amount: 1000, currency: 'EUR' }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(body)
    selectBookingBy.mockResolvedValue(booking)
    selectBookingPaymentBy.mockResolvedValue(bookingPayment)

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId }, body }, { sendStatus }))
      .resolves.toEqual(results)

    expect(sendStatus).toBeCalledWith(results)
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateBookingPaymentBy).toBeCalledWith({ id }, body)
    expect(changeBookingStatus).toBeCalledWith(booking, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
  })

  it('should throw an error for not found booking payment', async () => {
    const errorMessage = 'Not Found'
    const booking = { id: bookingId, currency: 'EUR' }

    selectBookingBy.mockResolvedValue(booking)
    selectBookingPaymentBy.mockResolvedValue(null)

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId }, body: {} }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(selectBookingPaymentBy).toBeCalledWith({ id, bookingId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error for not found booking', async () => {
    const errorMessage = 'Validation Failed'

    selectBookingBy.mockResolvedValue(null)

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ user: { accountId }, params: { id, bookingId }, body: {} }))
      .rejects.toThrow(errorMessage)

    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { bookingId: ['notExists'] },
    })
  })
})
