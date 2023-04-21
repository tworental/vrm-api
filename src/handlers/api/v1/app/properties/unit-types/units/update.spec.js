const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { validate } = require('../../../../../../../services/validate')
const { createTransaction } = require('../../../../../../../services/database')
const {
  selectOneBy: selectPropertyBy,
} = require('../../../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectUnitBy,
  updateBy: updateUnitsBy,
} = require('../../../../../../../models/v1/units/repositories')
const {
  upsertBy: upsertArrangementsBy,
} = require('../../../../../../../models/v1/unit-arrangements/repositories')
const {
  upsertBy: upsertAmenitiesBy,
} = require('../../../../../../../models/v1/unit-amenities/repositories')
const { UPDATE_SCHEMA } = require('../../../../../../../models/v1/units/schema')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/validate')
jest.mock('../../../../../../../services/database')
jest.mock('../../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../../models/v1/unit-arrangements/repositories')
jest.mock('../../../../../../../models/v1/unit-amenities/repositories')

const httpHandler = require('./update')

xdescribe('PATCH /v1/app/properties/:propertyId/unit-types/:propertyUnitTypeId/units/:id', () => {
  const body = 'body'
  const accountId = 1
  const propertyId = 100
  const propertyUnitTypeId = 1000
  const id = 1000
  const trx = 'trx'

  const payload = {
    name: 'name',
    arrangements: [{ id: 1 }],
    amenities: [{ id: 100 }],
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const response = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    createTransaction.mockImplementation((fn) => fn(trx))

    selectPropertyBy.mockResolvedValue(propertyId)
    selectUnitBy.mockResolvedValue(propertyId)
    validate.mockResolvedValue(payload)
    updateUnitsBy.mockResolvedValue()
    upsertArrangementsBy.mockResolvedValue()
    upsertAmenitiesBy.mockResolvedValue()

    await expect(httpHandler({
      body, user: { accountId }, params: { propertyId, propertyUnitTypeId, id },
    }, { sendStatus })).resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(updateUnitsBy).toBeCalledWith({ id }, { name: payload.name }, trx)
    expect(upsertArrangementsBy).toBeCalledWith(id, payload.arrangements, trx)
    expect(upsertAmenitiesBy).toBeCalledWith(id, payload.amenities, trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error when property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitBy).not.toBeCalled()
    expect(validate).not.toBeCalled()
    expect(updateUnitsBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when an unit does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(propertyId)
    selectUnitBy.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { accountId }, params: { propertyId, propertyUnitTypeId, id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(selectUnitBy).toBeCalledWith({ id, propertyId, propertyUnitTypeId })
    expect(validate).not.toBeCalled()
    expect(updateUnitsBy).not.toBeCalled()
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
