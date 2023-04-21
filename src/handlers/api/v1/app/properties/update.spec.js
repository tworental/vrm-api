const cache = require('../../../../../services/cacheManager')
const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const { selectOneBy: selectPropertyTypeBy } = require('../../../../../models/v1/dict-property-types/repositories')
const {
  selectOneBy: selectPropertyBy,
  updateBy: updatePropertiesBy,
  updateCompletenessStatus,
} = require('../../../../../models/v1/properties/repositories')
const {
  upsertBy: upsertUnitTypesArrangementsBy,
} = require('../../../../../models/v1/unit-type-arrangements/repositories')
const {
  selectOneBy: selectUnitTypeBy,
  updateBy: updateUnitTypesBy,
} = require('../../../../../models/v1/unit-types/repositories')
const {
  changeAccomodationSize: changeRateAccomodationSize,
} = require('../../../../../models/v1/unit-type-rate-prices/repositories')
const {
  changeAccomodationSize: changeRateSeasonAccomodationSize,
} = require('../../../../../models/v1/unit-type-rate-season-prices/repositories')
const { updateBy: updateUnitsBy } = require('../../../../../models/v1/units/repositories')
const { upsertBy: upsertPropertyAmenitiesBy } = require('../../../../../models/v1/property-amenities/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/properties/schema')

jest.mock('../../../../../services/cacheManager')
jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/database')
jest.mock('../../../../../models/v1/dict-property-types/repositories')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/unit-type-arrangements/repositories')
jest.mock('../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../models/v1/unit-type-rate-prices/repositories')
jest.mock('../../../../../models/v1/unit-type-rate-season-prices/repositories')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/property-amenities/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/properties/:id', () => {
  const id = 'id'
  const body = {
    amenities: 'amenities',
    arrangements: 'arrangements',
    area: 'area',
    areaUnit: 'areaUnit',
    totalGuests: 'totalGuests',
    maxAdults: 'maxAdults',
    maxChildren: 'maxChildren',
    maxInfants: 'maxInfants',
    status: 'status',
    isActive: 'isActive',
    floor: 'floor',
    name: 'unitName',
  }
  const trx = 'trx'

  const accountId = 'accountId'

  let sendStatus

  beforeEach(() => {
    sendStatus = jest.fn().mockImplementation((args) => args)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update single property resource', async () => {
    const response = 204
    const dictPropertyTypeId = 1
    const property = { id, name: 'Golden Tulip', multipleUnitTypes: '0' }
    const unitTypeId = 1

    selectPropertyBy.mockResolvedValue(property)
    validate.mockResolvedValue({ ...body, dictPropertyTypeId })
    selectPropertyTypeBy.mockResolvedValue(false)
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertPropertyAmenitiesBy.mockResolvedValue(null)
    selectUnitTypeBy.mockResolvedValue({ id: unitTypeId })
    updateUnitTypesBy.mockResolvedValue(null)

    updatePropertiesBy.mockResolvedValue(null)
    updateCompletenessStatus.mockResolvedValue(null)
    changeRateAccomodationSize.mockResolvedValue(null)
    changeRateSeasonAccomodationSize.mockResolvedValue(null)
    upsertUnitTypesArrangementsBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(validate).toBeCalledWith({ ...body }, { schema: UPDATE_SCHEMA })
    expect(selectPropertyTypeBy).toBeCalledWith({ id: dictPropertyTypeId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(upsertPropertyAmenitiesBy).toBeCalledWith(id, body.amenities, trx)
    expect(selectUnitTypeBy).toBeCalledWith({ propertyId: id }, trx)
    expect(updateUnitTypesBy).toBeCalledWith({ propertyId: id }, {
      name: body.name,
      area: body.area,
      areaUnit: body.areaUnit,
      totalGuests: body.totalGuests,
      maxAdults: body.maxAdults || body.totalGuests,
      maxChildren: body.maxChildren,
      maxInfants: body.maxInfants,
    }, trx)
    expect(changeRateAccomodationSize).toBeCalledWith({
      accountId, propertyUnitTypeId: unitTypeId,
    }, body.totalGuests, trx)
    expect(changeRateSeasonAccomodationSize).toBeCalledWith({
      accountId, propertyUnitTypeId: unitTypeId,
    }, body.totalGuests, trx)
    expect(upsertUnitTypesArrangementsBy).toBeCalledWith(unitTypeId, body.arrangements, trx)
    expect(updateUnitsBy).toBeCalledWith({ propertyId: id }, {
      name: body.name,
      area: body.area,
      areaUnit: body.areaUnit,
      isActive: body.isActive,
      floor: body.floor,
      status: body.status,
    }, trx)

    expect(updatePropertiesBy).toBeCalledWith({ id }, {
      name: body.name,
    }, trx)
    expect(updateCompletenessStatus).toBeCalledWith(id)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.properties.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update single property resource when propertyType is not false', async () => {
    const response = 204
    const dictPropertyTypeId = 1
    const property = { id, name: 'Golden Tulip', multipleUnitTypes: '0' }
    const unitTypeId = 1

    selectPropertyBy.mockResolvedValue(property)
    validate.mockResolvedValue({ ...body, dictPropertyTypeId })
    selectPropertyTypeBy.mockResolvedValue(true)
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertPropertyAmenitiesBy.mockResolvedValue(null)
    selectUnitTypeBy.mockResolvedValue({ id: unitTypeId })
    updateUnitTypesBy.mockResolvedValue(null)

    updatePropertiesBy.mockResolvedValue(null)
    updateCompletenessStatus.mockResolvedValue(null)
    changeRateAccomodationSize.mockResolvedValue(null)
    changeRateSeasonAccomodationSize.mockResolvedValue(null)
    upsertUnitTypesArrangementsBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(validate).toBeCalledWith({ ...body }, { schema: UPDATE_SCHEMA })
    expect(selectPropertyTypeBy).toBeCalledWith({ id: dictPropertyTypeId })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(upsertPropertyAmenitiesBy).toBeCalledWith(id, body.amenities, trx)
    expect(selectUnitTypeBy).toBeCalledWith({ propertyId: id }, trx)
    expect(updateUnitTypesBy).toBeCalledWith({ propertyId: id }, {
      name: body.name,
      area: body.area,
      areaUnit: body.areaUnit,
      totalGuests: body.totalGuests,
      maxAdults: body.maxAdults || body.totalGuests,
      maxChildren: body.maxChildren,
      maxInfants: body.maxInfants,
    }, trx)
    expect(changeRateAccomodationSize).toBeCalledWith({
      accountId, propertyUnitTypeId: unitTypeId,
    }, body.totalGuests, trx)
    expect(changeRateSeasonAccomodationSize).toBeCalledWith({
      accountId, propertyUnitTypeId: unitTypeId,
    }, body.totalGuests, trx)
    expect(upsertUnitTypesArrangementsBy).toBeCalledWith(unitTypeId, body.arrangements, trx)
    expect(updateUnitsBy).toBeCalledWith({ propertyId: id }, {
      name: body.name,
      area: body.area,
      areaUnit: body.areaUnit,
      isActive: body.isActive,
      floor: body.floor,
      status: body.status,
    }, trx)

    expect(updatePropertiesBy).toBeCalledWith({ id }, {
      name: body.name,
      dictPropertyTypeId,
    }, trx)
    expect(updateCompletenessStatus).toBeCalledWith(id)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.properties.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update single property resource when totalGuests exists only', async () => {
    const response = 204
    const property = { id, name: 'Golden Tulip', multipleUnitTypes: '0' }
    const unitTypeId = 1
    const newBody = {
      totalGuests: 'totalGuests',
      amenities: 'amenities',
    }

    selectPropertyBy.mockResolvedValue(property)
    validate.mockResolvedValue(newBody)
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertPropertyAmenitiesBy.mockResolvedValue(null)
    selectUnitTypeBy.mockResolvedValue({ id: unitTypeId })
    updateUnitTypesBy.mockResolvedValue(null)

    updatePropertiesBy.mockResolvedValue(null)
    updateCompletenessStatus.mockResolvedValue(null)
    changeRateAccomodationSize.mockResolvedValue(null)
    changeRateSeasonAccomodationSize.mockResolvedValue(null)
    upsertUnitTypesArrangementsBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(validate).toBeCalledWith({ ...body }, { schema: UPDATE_SCHEMA })
    expect(selectPropertyTypeBy).not.toBeCalled()
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(upsertPropertyAmenitiesBy).toBeCalledWith(id, newBody.amenities, trx)
    expect(selectUnitTypeBy).toBeCalledWith({ propertyId: id }, trx)
    expect(updateUnitTypesBy).toBeCalledWith({ propertyId: id }, {
      name: newBody.name,
      area: newBody.area,
      areaUnit: newBody.areaUnit,
      totalGuests: newBody.totalGuests,
      maxAdults: newBody.maxAdults || newBody.totalGuests,
      maxChildren: newBody.maxChildren,
      maxInfants: newBody.maxInfants,
    }, trx)
    expect(changeRateAccomodationSize).toBeCalledWith({
      accountId, propertyUnitTypeId: unitTypeId,
    }, newBody.totalGuests, trx)
    expect(changeRateSeasonAccomodationSize).toBeCalledWith({
      accountId, propertyUnitTypeId: unitTypeId,
    }, newBody.totalGuests, trx)
    expect(upsertUnitTypesArrangementsBy).not.toBeCalled()
    expect(updateUnitsBy).not.toBeCalled()

    expect(updatePropertiesBy).toBeCalledWith({ id }, {
      name: newBody.name,
    }, trx)
    expect(updateCompletenessStatus).toBeCalledWith(id)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.properties.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update single property resource when totalGuests does not exist', async () => {
    const response = 204
    const property = { id, name: 'Golden Tulip', multipleUnitTypes: '0' }
    const unitTypeId = 1
    const newBody = {
      totalGuests: undefined,
      amenities: 'amenities',
      area: 'area',
      areaUnit: 'areaUnit',
    }

    selectPropertyBy.mockResolvedValue(property)
    validate.mockResolvedValue(newBody)
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertPropertyAmenitiesBy.mockResolvedValue(null)
    selectUnitTypeBy.mockResolvedValue({ id: unitTypeId })
    updateUnitTypesBy.mockResolvedValue(null)

    updatePropertiesBy.mockResolvedValue(null)
    updateCompletenessStatus.mockResolvedValue(null)
    changeRateAccomodationSize.mockResolvedValue(null)
    changeRateSeasonAccomodationSize.mockResolvedValue(null)
    upsertUnitTypesArrangementsBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(validate).toBeCalledWith({ ...body }, { schema: UPDATE_SCHEMA })
    expect(selectPropertyTypeBy).not.toBeCalled()
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(upsertPropertyAmenitiesBy).toBeCalledWith(id, newBody.amenities, trx)
    expect(selectUnitTypeBy).toBeCalledWith({ propertyId: id }, trx)
    expect(updateUnitTypesBy).toBeCalledWith({ propertyId: id }, {
      name: newBody.name,
      area: newBody.area,
      areaUnit: newBody.areaUnit,
      totalGuests: newBody.totalGuests,
      maxAdults: newBody.maxAdults || newBody.totalGuests,
      maxChildren: newBody.maxChildren,
      maxInfants: newBody.maxInfants,
    }, trx)
    expect(changeRateAccomodationSize).not.toBeCalled()
    expect(changeRateSeasonAccomodationSize).not.toBeCalled()
    expect(upsertUnitTypesArrangementsBy).not.toBeCalled()
    expect(updateUnitsBy).toBeCalledWith({ propertyId: id }, {
      name: newBody.name,
      area: newBody.area,
      areaUnit: newBody.areaUnit,
      isActive: newBody.isActive,
      floor: newBody.floor,
      status: newBody.status,
    }, trx)

    expect(updatePropertiesBy).toBeCalledWith({ id }, {
      name: newBody.name,
    }, trx)
    expect(updateCompletenessStatus).toBeCalledWith(id)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.properties.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update single property resource when amenities exists only', async () => {
    const response = 204
    const property = { id, name: 'Golden Tulip', multipleUnitTypes: '0' }
    const unitTypeId = 1
    const newBody = {
      amenities: 'amenities',
    }

    selectPropertyBy.mockResolvedValue(property)
    validate.mockResolvedValue(newBody)
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertPropertyAmenitiesBy.mockResolvedValue(null)
    selectUnitTypeBy.mockResolvedValue({ id: unitTypeId })
    updateUnitTypesBy.mockResolvedValue(null)

    updatePropertiesBy.mockResolvedValue(null)
    updateCompletenessStatus.mockResolvedValue(null)
    changeRateAccomodationSize.mockResolvedValue(null)
    changeRateSeasonAccomodationSize.mockResolvedValue(null)
    upsertUnitTypesArrangementsBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(validate).toBeCalledWith({ ...body }, { schema: UPDATE_SCHEMA })
    expect(selectPropertyTypeBy).not.toBeCalled()
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(upsertPropertyAmenitiesBy).toBeCalledWith(id, newBody.amenities, trx)
    expect(selectUnitTypeBy).toBeCalledWith({ propertyId: id }, trx)
    expect(updateUnitTypesBy).not.toBeCalled()
    expect(changeRateAccomodationSize).not.toBeCalled()
    expect(changeRateSeasonAccomodationSize).not.toBeCalled()
    expect(upsertUnitTypesArrangementsBy).not.toBeCalled()
    expect(updateUnitsBy).not.toBeCalled()

    expect(updatePropertiesBy).toBeCalledWith({ id }, {
      name: newBody.name,
    }, trx)
    expect(updateCompletenessStatus).toBeCalledWith(id)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.properties.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update multiple property resource', async () => {
    const response = 204
    const property = { id, name: 'Golden Tulip', multipleUnitTypes: '1' }
    const unitTypeId = 1
    const newBody = {
      amenities: 'amenities',
    }

    selectPropertyBy.mockResolvedValue(property)
    validate.mockResolvedValue(newBody)
    createTransaction.mockImplementation((fn) => fn(trx))
    upsertPropertyAmenitiesBy.mockResolvedValue(null)
    selectUnitTypeBy.mockResolvedValue({ id: unitTypeId })
    updateUnitTypesBy.mockResolvedValue(null)

    updatePropertiesBy.mockResolvedValue(null)
    updateCompletenessStatus.mockResolvedValue(null)
    changeRateAccomodationSize.mockResolvedValue(null)
    changeRateSeasonAccomodationSize.mockResolvedValue(null)
    upsertUnitTypesArrangementsBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(validate).toBeCalledWith({ ...body }, { schema: UPDATE_SCHEMA })
    expect(selectPropertyTypeBy).not.toBeCalled()
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(upsertPropertyAmenitiesBy).toBeCalledWith(id, newBody.amenities, trx)
    expect(selectUnitTypeBy).not.toBeCalled()
    expect(updateUnitTypesBy).not.toBeCalled()
    expect(changeRateAccomodationSize).not.toBeCalled()
    expect(changeRateSeasonAccomodationSize).not.toBeCalled()
    expect(upsertUnitTypesArrangementsBy).not.toBeCalled()
    expect(updateUnitsBy).not.toBeCalled()

    expect(updatePropertiesBy).toBeCalledWith({ id }, {
      name: newBody.name,
    }, trx)
    expect(updateCompletenessStatus).toBeCalledWith(id)
    expect(cache.del).toBeCalledWith([
      `accounts.${accountId}.properties.*`,
      `accounts.${accountId}.statistics.*`,
    ])
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should throw an error if the property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ body, params: { id }, user: { accountId } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
