const cache = require('../../../../../../../services/cacheManager')
const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const {
  selectOneBy: selectPropertyBy,
} = require('../../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectOneUnitBy,
  deleteBy: deleteUnitsBy,
} = require('../../../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectBookingBy,
} = require('../../../../../../../models/v1/bookings/repositories')

jest.mock('../../../../../../../services/cacheManager')
jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../../models/v1/bookings/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/properties/:propertyId/unit-types/:propertyUnitTypeId/units/:id', () => {
  const cacheKey = 'cacheKey'
  const accountId = 1
  const propertyId = 100
  const propertyUnitTypeId = 100
  const id = 1000

  beforeEach(() => {
    cache.wrap.mockImplementation((key, fn) => fn())
    cache.key.mockReturnValue(cacheKey)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const unit = 'unit'
    const response = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    const whereRaw = jest.fn()
    const whereIn = jest.fn().mockReturnValue({ whereRaw })
    selectPropertyBy.mockResolvedValue(propertyId)
    selectBookingBy.mockReturnValue({ whereIn })
    selectOneUnitBy.mockResolvedValue(unit)

    deleteUnitsBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()

    expect(whereIn).toBeCalledWith('status', ['tentative', 'confirmed'])
    expect(whereRaw).toBeCalledWith('date_arrival >= NOW()')
    expect(selectBookingBy).toBeCalledWith({ accountId, propertyUnitTypeUnitId: id })
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(deleteUnitsBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).not.toBeCalled()
    expect(deleteUnitsBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when unit does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(deleteUnitsBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if booking exists', async () => {
    const errorMessage = 'Booking Attached'
    const unit = 'unit'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const whereRaw = jest.fn().mockResolvedValue(true)
    const whereIn = jest.fn().mockReturnValue({ whereRaw })
    selectPropertyBy.mockResolvedValue(propertyId)
    selectBookingBy.mockReturnValue({ whereIn })
    selectOneUnitBy.mockResolvedValue(unit)

    await expect(httpHandler({ user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(whereIn).toBeCalledWith('status', ['tentative', 'confirmed'])
    expect(whereRaw).toBeCalledWith('date_arrival >= NOW()')
    expect(selectBookingBy).toBeCalledWith({ accountId, propertyUnitTypeUnitId: id })
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(deleteUnitsBy).not.toBeCalled()
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'BOOKINGS_ATTACHED' })
  })
})
