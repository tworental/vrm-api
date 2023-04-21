const cache = require('../../../../../../services/cacheManager')
const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const { amountByCurrency } = require('../../../../../../models/v1/dict-currency-rates/repositories')
const {
  selectOneBy: selectBookingBy,
  updateBy: updateBookingBy,
  changeBookingStatus,
} = require('../../../../../../models/v1/bookings/repositories')
const {
  create: createBookingPayment,
  sum: sumBookingPayment,
} = require('../../../../../../models/v1/booking-payments/repositories')
const { CREATE_SCHEMA } = require('../../../../../../models/v1/booking-payments/schema')

jest.mock('../../../../../../services/cacheManager')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/dict-currency-rates/repositories')
jest.mock('../../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../../models/v1/booking-payments/repositories')

const httpHandler = require('./create')

describe('POST /v1/app/bookings/:bookingId/payments', () => {
  const accountId = 1
  const bookingId = 1
  const trx = 'trx'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should create a resource for different currencies', async () => {
    const data = { id: 1 }
    const body = { currency: 'EUR', amount: 1000 }
    const booking = {
      id: 1,
      currency: 'USD',
    }
    const currencyRate = 1.5
    const bookingPaymentId = 1
    const amountTotalPaid = 1000

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(body)
    selectBookingBy.mockResolvedValue(booking)

    const currencyRateFn = jest.fn().mockReturnValue(currencyRate)
    amountByCurrency.mockResolvedValue(currencyRateFn)

    createTransaction.mockImplementation((fn) => fn(trx))

    createBookingPayment.mockResolvedValue(bookingPaymentId)
    sumBookingPayment.mockResolvedValue({ sum: amountTotalPaid })

    await expect(httpHandler({ user: { accountId }, params: { bookingId }, body }, { status }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(amountByCurrency).toBeCalledWith(booking.currency)
    expect(currencyRateFn).toBeCalledWith(body.amount, body.currency)
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createBookingPayment).toBeCalledWith({ ...body, bookingId }, trx)
    expect(sumBookingPayment).toBeCalledWith('amount_exchanged', { bookingId }, trx)
    expect(updateBookingBy).toBeCalledWith({ id: bookingId }, { amountTotalPaid }, trx)
    expect(changeBookingStatus).toBeCalledWith({ ...booking, amountTotalPaid }, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data })
  })

  it('should create a resource for the same currencies', async () => {
    const data = { id: 1 }
    const body = { currency: 'EUR', amount: 1000 }
    const booking = {
      id: 1,
      currency: 'EUR',
    }
    const bookingPaymentId = 1
    const amountTotalPaid = 1000

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(body)
    selectBookingBy.mockResolvedValue(booking)

    createTransaction.mockImplementation((fn) => fn(trx))

    createBookingPayment.mockResolvedValue(bookingPaymentId)
    sumBookingPayment.mockResolvedValue({ sum: amountTotalPaid })

    await expect(httpHandler({ user: { accountId }, params: { bookingId }, body }, { status }))
      .resolves.toEqual({ data })

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createBookingPayment).toBeCalledWith({ ...body, bookingId }, trx)
    expect(sumBookingPayment).toBeCalledWith('amount_exchanged', { bookingId }, trx)
    expect(updateBookingBy).toBeCalledWith({ id: bookingId }, { amountTotalPaid }, trx)
    expect(changeBookingStatus).toBeCalledWith({ ...booking, amountTotalPaid }, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data })
  })

  it('should create a resource for provided currencyRate', async () => {
    const data = { id: 1 }
    const body = { currency: 'EUR', amount: 1000, currencyRate: 1 }
    const booking = {
      id: 1,
      currency: 'EUR',
    }
    const bookingPaymentId = 1
    const amountTotalPaid = 1000

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    validate.mockResolvedValue(body)
    selectBookingBy.mockResolvedValue(booking)

    createTransaction.mockImplementation((fn) => fn(trx))

    createBookingPayment.mockResolvedValue(bookingPaymentId)
    sumBookingPayment.mockResolvedValue({ sum: amountTotalPaid })

    await expect(httpHandler({ user: { accountId }, params: { bookingId }, body }, { status }))
      .resolves.toEqual({ data })

    expect(validate).toBeCalledWith(body, { schema: CREATE_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(createBookingPayment).toBeCalledWith({ ...body, bookingId }, trx)
    expect(sumBookingPayment).toBeCalledWith('amount_exchanged', { bookingId }, trx)
    expect(updateBookingBy).toBeCalledWith({ id: bookingId }, { amountTotalPaid }, trx)
    expect(changeBookingStatus).toBeCalledWith({ ...booking, amountTotalPaid }, trx)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.bookings.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(status).toBeCalledWith(201)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw not found error for not found booking', async () => {
    const errorMessage = 'Validation Failed'
    const body = 'body'

    selectBookingBy.mockResolvedValue(null)

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ user: { accountId }, params: { bookingId }, body }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { bookingId: ['notExists'] },
    })
    expect(selectBookingBy).toBeCalledWith({ accountId, id: bookingId })
  })
})
