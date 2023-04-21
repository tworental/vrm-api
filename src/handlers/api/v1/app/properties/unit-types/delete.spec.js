const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { createTransaction } = require('../../../../../../services/database')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectUnitTypesBy,
  deleteBy: deleteUnitTypesBy,
} = require('../../../../../../models/v1/unit-types/repositories')
const {
  deleteBy: deleteUnitsBy,
} = require('../../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectBookingBy,
} = require('../../../../../../models/v1/bookings/repositories')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../models/v1/bookings/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/properties/:propertyId/unit-types/:id', () => {
  const accountId = 1
  const propertyId = 100
  const id = 1000
  const trx = 'trx'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const unitTypes = ['type1', 'type2']
    const response = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    const whereRaw = jest.fn()
    const whereIn = jest.fn().mockReturnValue({ whereRaw })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectUnitTypesBy.mockResolvedValue(unitTypes)
    selectBookingBy.mockReturnValue({ whereIn })
    deleteUnitTypesBy.mockResolvedValue()
    deleteUnitsBy.mockResolvedValue()

    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitTypesBy).toBeCalledWith({ propertyId })
    expect(whereIn).toBeCalledWith('status', ['tentative', 'confirmed'])
    expect(whereRaw).toBeCalledWith('date_arrival >= NOW()')
    expect(selectBookingBy).toBeCalledWith({ accountId, propertyUnitTypeId: id })
    expect(deleteUnitTypesBy).toBeCalledWith({ id, propertyId })
    expect(deleteUnitTypesBy).toBeCalledWith({ id, propertyId }, trx)
    expect(deleteUnitsBy).toBeCalledWith({ propertyId, propertyUnitTypeId: id }, trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when a property is not found', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitTypesBy).not.toBeCalled()
    expect(deleteUnitTypesBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if unit type does not exists', async () => {
    const unitTypes = []
    const errorMessage = 'Minimum 1 UnitType must exists'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectUnitTypesBy.mockResolvedValue(unitTypes)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitTypesBy).toBeCalledWith({ propertyId })
    expect(deleteUnitTypesBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage)
  })

  it('should throw an error if booking exists', async () => {
    const unitTypes = ['type1', 'type2']
    const booking = { id: 1 }
    const errorMessage = 'Booking Attached'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const whereRaw = jest.fn().mockResolvedValue(booking)
    const whereIn = jest.fn().mockReturnValue({ whereRaw })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectUnitTypesBy.mockResolvedValue(unitTypes)
    selectBookingBy.mockReturnValue({ whereIn })

    await expect(httpHandler({ user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitTypesBy).toBeCalledWith({ propertyId })
    expect(whereIn).toBeCalledWith('status', ['tentative', 'confirmed'])
    expect(whereRaw).toBeCalledWith('date_arrival >= NOW()')
    expect(selectBookingBy).toBeCalledWith({ accountId, propertyUnitTypeId: id })
    expect(deleteUnitTypesBy).not.toBeCalled()
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'BOOKINGS_ATTACHED' })
  })
})
