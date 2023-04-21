const createError = require('../../../../../../services/errors')
const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const { createTransaction } = require('../../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectOneUnitTypeBy,
  updateBy: updateUnitTypeBy,
} = require('../../../../../../models/v1/unit-types/repositories')
const {
  updateBy: updateUnitsBy,
} = require('../../../../../../models/v1/units/repositories')
const {
  upsertBy: upsertArrangementsBy,
} = require('../../../../../../models/v1/unit-type-arrangements/repositories')
const {
  upsertBy: upsertAmenitiesBy,
} = require('../../../../../../models/v1/unit-type-amenities/repositories')
const {
  selectOneBy: selectGuestTypeBy,
} = require('../../../../../../models/v1/dict-guest-types/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../models/v1/unit-types/schema')

jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/database')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../models/v1/unit-type-arrangements/repositories')
jest.mock('../../../../../../models/v1/unit-type-amenities/repositories')
jest.mock('../../../../../../models/v1/dict-guest-types/repositories')

const httpHandler = require('./update')

xdescribe('PATCH /v1/app/properties/:propertyId/unit-types/:id', () => {
  const body = {
    name: 'name',
    dictGuestTypeId: 100,
    area: 100,
    areaUnit: 'sqm',
    arrangements: [{ id: 1 }],
    amenities: [{ id: 100 }],
  }

  const accountId = 1
  const propertyId = 100
  const id = 1000
  const trx = 'trx'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const response = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    createTransaction.mockImplementation((fn) => fn(trx))

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitTypeBy.mockResolvedValue({ id })
    validate.mockResolvedValue(body)
    selectGuestTypeBy.mockResolvedValue(null)
    updateUnitTypeBy.mockResolvedValue()
    updateUnitsBy.mockResolvedValue()
    upsertArrangementsBy.mockResolvedValue()
    upsertAmenitiesBy.mockResolvedValue()

    await expect(httpHandler({ body, user: { accountId }, params: { propertyId, id } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id, propertyId })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectGuestTypeBy).toBeCalledWith({ id: 100 })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateUnitTypeBy).toBeCalledWith({ id }, { name: 'name', area: 100, areaUnit: 'sqm' }, trx)
    expect(updateUnitsBy).toBeCalledWith({ propertyId, propertyUnitTypeId: id, area: null }, {
      area: body.area,
      areaUnit: body.areaUnit,
    }, trx)
    expect(upsertArrangementsBy).toBeCalledWith(id, body.arrangements, trx)
    expect(upsertAmenitiesBy).toBeCalledWith(id, body.amenities, trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).not.toBeCalled()
    expect(validate).not.toBeCalled()
    expect(updateUnitTypeBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when unit type does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectOneUnitTypeBy.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { accountId }, params: { propertyId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectOneUnitTypeBy).toBeCalledWith({ id, propertyId })
    expect(validate).not.toBeCalled()
    expect(updateUnitTypeBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
