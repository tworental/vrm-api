const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { createTransaction } = require('../../../../../services/database')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/properties/repositories')
const {
  deleteBy: deleteUnitTypesBy,
} = require('../../../../../models/v1/unit-types/repositories')
const {
  deleteBy: deleteUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectBookingBy,
} = require('../../../../../models/v1/bookings/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/bookings/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/properties/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204
    const trx = 'trx'

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const whereRaw = jest.fn()
    const whereIn = jest.fn().mockReturnValue({ whereRaw })

    deleteBy.mockResolvedValue()
    selectOneBy.mockResolvedValue({ id })
    selectBookingBy.mockReturnValue({ whereIn })
    deleteUnitTypesBy.mockResolvedValue()
    deleteUnitsBy.mockResolvedValue()

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(whereIn).toBeCalledWith('status', ['tentative', 'confirmed'])
    expect(whereRaw).toBeCalledWith('date_arrival >= NOW()')
    expect(selectBookingBy).toBeCalledWith({ accountId: 100, propertyId: id })
    expect(deleteBy).toBeCalledWith({ id }, trx)
    expect(deleteUnitTypesBy).toBeCalledWith({ propertyId: id }, trx)
    expect(deleteUnitsBy).toBeCalledWith({ propertyId: id }, trx)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if owner does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if booking exists', async () => {
    const errorMessage = 'Booking Attached'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const whereRaw = jest.fn().mockResolvedValue(true)
    const whereIn = jest.fn().mockReturnValue({ whereRaw })

    selectOneBy.mockResolvedValue({ id })
    selectBookingBy.mockReturnValue({ whereIn })

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(whereIn).toBeCalledWith('status', ['tentative', 'confirmed'])
    expect(whereRaw).toBeCalledWith('date_arrival >= NOW()')
    expect(selectBookingBy).toBeCalledWith({ accountId: 100, propertyId: id })
    expect(deleteBy).not.toBeCalled()
    expect(deleteUnitTypesBy).not.toBeCalled()
    expect(deleteUnitsBy).not.toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'BOOKINGS_ATTACHED' })
  })
})
