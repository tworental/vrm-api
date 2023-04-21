const { createTransaction, raw } = require('../../../../../../services/database')
const createError = require('../../../../../../services/errors')
const dayjs = require('../../../../../../services/dayjs')
const { handler } = require('../../../../../../services/http')
const {
  upsertProperty: upsertChannexProperty,
  upsertRoomType: upsertChannexRoomType,
  upsertRatePlan: upsertChannexRatePlan,
  upsertRatePlanRestriction: upsertChannexRatePlanRestriction,
  upsertTax: upsertChannexTax,
  upsertFee: upsertChannexFee,
  upsertSubscription,
  updateAvailability: updateChannexAvailability,
  deleteProperty: deleteChannexProperty,
} = require('../../../../../../services/channex')
const {
  selectOneBy: selectProperty,
  isPropertyCompleted,
  updateBy: updatePropertiesBy,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyTaxesBy,
  updateBy: updatePropertyTaxesBy,
} = require('../../../../../../models/v1/property-taxes/repositories')
const {
  getLogicType: getTaxLogic,
} = require('../../../../../../models/v1/taxes/repositories')
const {
  selectBy: selectPropertyFeesBy,
  updateBy: updatePropertyFeesBy,
} = require('../../../../../../models/v1/property-fees/repositories')
const {
  getLogicType: getFeeLogic,
} = require('../../../../../../models/v1/fees/repositories')
const {
  selectBy: selectUnitTypesBy,
  updateBy: updateUnitTypesBy,
} = require('../../../../../../models/v1/unit-types/repositories')
const {
  selectBy: selectUnitTypeRatesBy,
  updateBy: updateUnitTypeRatesBy,
} = require('../../../../../../models/v1/unit-type-rates/repositories')
const {
  selectBy: selectUnitTypeRatePricesBy,
} = require('../../../../../../models/v1/unit-type-rate-prices/repositories')
const {
  selectBy: selectUnitTypeRateSeasonsBy,
  updateBy: updateUnitTypeRateSeasonsBy,
} = require('../../../../../../models/v1/unit-type-rate-seasons/repositories')
const {
  selectBy: selectUnitTypeRateSeasonPricesBy,
} = require('../../../../../../models/v1/unit-type-rate-season-prices/repositories')
const {
  selectBy: selectUnitsBy,
} = require('../../../../../../models/v1/units/repositories')
const {
  selectOneBy: selectChannelManagerBy,
  withAccount,
} = require('../../../../../../models/v1/channel-managers/repositories')
const {
  selectOneBy: selectPropertyChannelManagerBy,
  updateBy: updatePropertyChannelManagerBy,
  create: createPropertyChannelManager,
} = require('../../../../../../models/v1/property-channel-managers/repositories')
const {
  selectBy: selectPropertyAmenitiesBy,
} = require('../../../../../../models/v1/property-amenities/repositories')
const {
  selectBy: selectUnitTypeAmenitiesBy,
} = require('../../../../../../models/v1/unit-type-amenities/repositories')
const { storageFiles } = require('../../../../../../models/v1/property-images/repositories')

jest.mock('../../../../../../services/database')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/dayjs')
jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/channex')
jest.mock('../../../../../../models/v1/properties/repositories')
jest.mock('../../../../../../models/v1/property-taxes/repositories')
jest.mock('../../../../../../models/v1/taxes/repositories')
jest.mock('../../../../../../models/v1/property-fees/repositories')
jest.mock('../../../../../../models/v1/fees/repositories')
jest.mock('../../../../../../models/v1/unit-types/repositories')
jest.mock('../../../../../../models/v1/unit-type-rates/repositories')
jest.mock('../../../../../../models/v1/unit-type-rate-prices/repositories')
jest.mock('../../../../../../models/v1/unit-type-rate-seasons/repositories')
jest.mock('../../../../../../models/v1/unit-type-rate-season-prices/repositories')
jest.mock('../../../../../../models/v1/units/repositories')
jest.mock('../../../../../../models/v1/channel-managers/repositories')
jest.mock('../../../../../../models/v1/property-channel-managers/repositories')
jest.mock('../../../../../../models/v1/property-amenities/repositories')
jest.mock('../../../../../../models/v1/unit-type-amenities/repositories')
jest.mock('../../../../../../models/v1/property-images/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/properties/:propertyId/channels/:channelId', () => {
  const propertyId = 1
  const accountId = 100
  const accountChannexId = 'accountChannexId'
  const currency = 'EUR'
  const timezone = 'timezone'
  const settings = { currency, timezone }
  const channelId = 1

  const email = 'email'
  const phoneNumber = 'phoneNumber'

  const property = {
    name: 'property',
    channexId: 'channexId',
    channexSubscriptionId: 'channexSubscriptionId',
    description: 'description',
    address: {},
    coordinates: {},
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should enable channel and update property manager', async () => {
    const results = 200
    const trx = 'trx'

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(true)

    withAccount.mockImplementation(() => (queryBuilder) => queryBuilder)
    const selectChannels = jest.fn().mockResolvedValue({ channelManagerAccountId: 1 })
    const whereChannels = jest.fn().mockReturnValue({ select: selectChannels })
    selectChannelManagerBy.mockReturnValue({ where: whereChannels })
    raw.mockReturnValue('channel_manager_accounts.id AS channelManagerAccountId')

    selectPropertyChannelManagerBy.mockResolvedValue(true)

    const unitTypeDefaultRates = [
      {
        id: 1,
        name: 'name',
        propertyUnitTypeId: 1,
        currency: 'EUR',
        channexId: 'channexId',
      },
    ]
    const unitTypeRatePrices = [
      {
        id: 1,
        accountId: 1,
        propertyUnitTypeRateId: 1,
        enabled: 1,
        occupancy: 1,
        priceNightly: 100,
        priceWeekdayMo: 100,
        priceWeekdayTu: 100,
        priceWeekdayWe: 100,
        priceWeekdayTh: 100,
        priceWeekdayFr: 100,
        priceWeekdaySa: 100,
        priceWeekdaySu: 100,
      },
      {
        id: 2,
        accountId: 1,
        propertyUnitTypeRateId: 1,
        enabled: 1,
        occupancy: 2,
        priceNightly: 100,
        priceWeekdayMo: 100,
        priceWeekdayTu: 100,
        priceWeekdayWe: 100,
        priceWeekdayTh: 100,
        priceWeekdayFr: 100,
        priceWeekdaySa: 100,
        priceWeekdaySu: 100,
      },
    ]
    const unitTypeSeasonRates = [
      {
        id: 1,
        currency: 'EUR',
        startDate: 'date',
        endDate: 'date',
        propertyUnitTypeId: 1,
        propertyUnitTypeRateId: 1,
        channexId: 'channexId',
      },
    ]
    const unitTypeSeasonRatePrices = [
      {
        id: 1,
        propertyUnitTypeRateSeasonId: 1,
        accountId: 1,
        enabled: 1,
        occupancy: 1,
        priceNightly: 100,
        priceWeekdayMo: 100,
        priceWeekdayTu: 100,
        priceWeekdayWe: 100,
        priceWeekdayTh: 100,
        priceWeekdayFr: 100,
        priceWeekdaySa: 100,
        priceWeekdaySu: 100,
      },
      {
        id: 2,
        propertyUnitTypeRateSeasonId: 1,
        accountId: 1,
        enabled: 1,
        occupancy: 2,
        priceNightly: 100,
        priceWeekdayMo: 100,
        priceWeekdayTu: 100,
        priceWeekdayWe: 100,
        priceWeekdayTh: 100,
        priceWeekdayFr: 100,
        priceWeekdaySa: 100,
        priceWeekdaySu: 100,
      },
    ]
    const unitTypes = [
      {
        id: 1,
        propertyId,
        channexId: 'channexId',
        name: 'name',
        totalGuests: 2,
        maxChildren: 2,
        maxInfants: 2,
        description: 'description',
      },
    ]
    const units = [
      {
        id: 1,
        propertyId,
        propertyUnitTypeId: 1,
      },
    ]

    const propertyFacilities = [
      { channexId: 'channexId' },
    ]
    const unitTypeFacilities = [
      { channexId: 'channexId', propertyUnitTypeId: 1 },
    ]

    const photos = [{ url: 'url' }]
    const unitTypePhotos = [{ url: 'url' }]

    const propertyTaxes = [
      {
        channexId: 'channexId',
        rateType: 'fixed',
        amount: 10,
        name: 'name',
        currency,
        propertyTaxId: 1,
      },
      {
        channexId: 'channexId',
        rateType: 'percentage',
        percentage: 10,
        name: 'name 2',
        currency,
        propertyTaxId: 1,
      },
    ]
    const propertyFees = [
      {
        channexId: 'channexId',
        rateType: 'fixed',
        amount: 10,
        name: 'name',
        currency,
        propertyFeeId: 1,
      },
      {
        channexId: 'channexId',
        rateType: 'percentage',
        percentage: 10,
        name: 'name 2',
        currency,
        propertyFeeId: 1,
      },
    ]

    const dayjsObj = {
      add: () => dayjsObj,
      format: () => 'YYYY-MM-DD',
      isBefore: () => false,
    }

    dayjs.mockImplementation(() => dayjsObj)

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    selectUnitTypeRatesBy.mockResolvedValue(unitTypeDefaultRates)

    const whereInRatePrices = jest.fn().mockResolvedValue(unitTypeRatePrices)
    selectUnitTypeRatePricesBy.mockReturnValue({ whereIn: whereInRatePrices })

    const whereInSeasonRates = jest.fn().mockResolvedValue(unitTypeSeasonRates)
    const whereRawSeasonRates = jest.fn().mockReturnValue({ whereIn: whereInSeasonRates })
    selectUnitTypeRateSeasonsBy.mockReturnValue({ whereRaw: whereRawSeasonRates })

    const whereInSeasonRatePrices = jest.fn().mockResolvedValue(unitTypeSeasonRatePrices)
    selectUnitTypeRateSeasonPricesBy.mockReturnValue({ whereIn: whereInSeasonRatePrices })

    selectUnitTypesBy.mockResolvedValue(unitTypes)
    selectUnitsBy.mockResolvedValue(units)

    const whereRawPropertyFacilities = jest.fn().mockResolvedValue(propertyFacilities)
    const joinPropertyFacilities = jest.fn().mockReturnValue({ whereRaw: whereRawPropertyFacilities })
    const selectPropertyFacilities = jest.fn().mockReturnValue({ join: joinPropertyFacilities })
    selectPropertyAmenitiesBy.mockReturnValue({ select: selectPropertyFacilities })

    const whereRawUnitTypeFacilities = jest.fn().mockResolvedValue(unitTypeFacilities)
    const whereInUnitTypeFacilities = jest.fn().mockReturnValue({ whereRaw: whereRawUnitTypeFacilities })
    const joinUnitTypeFacilities = jest.fn().mockReturnValue({ whereIn: whereInUnitTypeFacilities })
    const selectUnitTypeFacilities = jest.fn().mockReturnValue({ join: joinUnitTypeFacilities })
    selectUnitTypeAmenitiesBy.mockReturnValue({ select: selectUnitTypeFacilities })

    storageFiles.mockResolvedValueOnce(photos)

    upsertChannexProperty.mockResolvedValue({ data: { id: 'channex-property' } })
    upsertSubscription.mockResolvedValue({ data: { id: 'channex-subscription' } })
    updatePropertiesBy.mockResolvedValue()

    storageFiles.mockResolvedValueOnce(unitTypePhotos)

    upsertChannexRoomType.mockResolvedValue({ data: { id: 'channex-room-type' } })
    upsertChannexRatePlan.mockResolvedValue({ data: { id: 'channex-rate-plan' } })
    upsertChannexRatePlanRestriction.mockResolvedValue({ data: [{ id: 'channex-rate-plan-restriction' }] })
    updateChannexAvailability.mockResolvedValue()

    updateUnitTypeRateSeasonsBy.mockResolvedValue()
    updateUnitTypeRatesBy.mockResolvedValue()

    const joinPropertyTaxes = jest.fn().mockResolvedValue(propertyTaxes)
    const selectPropertyTaxes = jest.fn().mockReturnValue({ join: joinPropertyTaxes })
    selectPropertyTaxesBy.mockReturnValue({ select: selectPropertyTaxes })

    upsertChannexTax.mockResolvedValue({ data: { id: 'channex-tax' } })
    updatePropertyTaxesBy.mockResolvedValue()

    const joinPropertyFees = jest.fn().mockResolvedValue(propertyFees)
    const selectPropertyFees = jest.fn().mockReturnValue({ join: joinPropertyFees })
    selectPropertyFeesBy.mockReturnValue({ select: selectPropertyFees })

    upsertChannexFee.mockResolvedValue({ data: { id: 'channex-fee' } })
    updatePropertyFeesBy.mockResolvedValue()

    getTaxLogic.mockReturnValue('logic')
    getFeeLogic.mockReturnValue('logic')

    await expect(httpHandler({
      body: { enabled: true },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: accountChannexId, settings },
    }, { sendStatus }))
      .resolves.toBe(results)

    expect(handler).toBeCalled()
    expect(selectPropertyChannelManagerBy).toBeCalledWith({
      channelManagerAccountId: 1,
      accountId,
      propertyId,
    })
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(withAccount).toBeCalledWith(accountId)
    expect(selectChannels).toBeCalledWith('channel_manager_accounts.id AS channelManagerAccountId')
    expect(whereChannels).toBeCalledWith('channel_managers.id', '=', channelId)
    expect(selectChannelManagerBy).toBeCalled()

    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(selectUnitTypeRatesBy).toBeCalledWith({ propertyId, accountId }, trx)

    expect(selectUnitTypeRatePricesBy).toBeCalledWith({ accountId }, trx)
    expect(whereInRatePrices).toBeCalledWith('property_unit_type_rate_id', unitTypeDefaultRates.map((item) => item.id))

    expect(selectUnitTypeRateSeasonsBy).toBeCalledWith({ accountId }, trx)
    expect(whereRawSeasonRates).toBeCalledWith('end_date >= NOW()')
    expect(whereInSeasonRates).toBeCalledWith('property_unit_type_rate_id', unitTypeDefaultRates.map((item) => item.id))

    expect(selectUnitTypeRateSeasonPricesBy).toBeCalledWith({ accountId }, trx)
    expect(whereInSeasonRatePrices)
      .toBeCalledWith('property_unit_type_rate_season_id', unitTypeSeasonRates.map((item) => item.id))

    expect(selectUnitTypesBy).toBeCalledWith({ propertyId }, trx)
    expect(selectUnitsBy).toBeCalledWith({ propertyId }, trx)

    expect(selectPropertyAmenitiesBy).toBeCalledWith({ propertyId }, trx)
    expect(selectPropertyFacilities).toBeCalledWith(['dict_amenities.channex_id'])
    expect(joinPropertyFacilities)
      .toBeCalledWith('dict_amenities', 'dict_amenities.id', 'property_amenities.dict_amenity_id')
    expect(whereRawPropertyFacilities)
      .toBeCalledWith('dict_amenities.channex_id IS NOT NULL AND dict_amenities.channex_id != \'\'')

    expect(selectUnitTypeAmenitiesBy).toBeCalledWith({}, trx)
    expect(selectUnitTypeFacilities).toBeCalledWith(['dict_amenities.channex_id'])
    expect(joinUnitTypeFacilities)
      .toBeCalledWith('dict_amenities', 'dict_amenities.id', 'property_unit_type_amenities.dict_amenity_id')
    expect(whereInUnitTypeFacilities)
      .toBeCalledWith('property_unit_type_id', unitTypes.map(({ id }) => id))
    expect(whereRawUnitTypeFacilities)
      .toBeCalledWith('dict_amenities.channex_id IS NOT NULL AND dict_amenities.channex_id != \'\'')

    expect(storageFiles).toBeCalledWith(propertyId)

    expect(upsertChannexProperty).toBeCalledWith(accountChannexId, {
      id: property.channexId,
      name: property.name,
      description: property.description,
      currency,
      email,
      phoneNumber,
      timezone: settings.timezone,
      ...property.address,
      ...property.coordinates,
      photos,
      facilities: propertyFacilities.map((facility) => facility.channexId),
    })
    expect(upsertSubscription).toBeCalledWith({
      id: property.channexSubscriptionId,
      propertyId: 'channex-property',
    })
    expect(updatePropertiesBy).toBeCalledWith(
      { id: propertyId, accountId },
      {
        channexId: 'channex-property',
        channexSubscriptionId: 'channex-subscription',
      },
      trx,
    )
    expect(storageFiles).toBeCalledWith(propertyId, 1)
    expect(upsertChannexRoomType).toBeCalledWith({
      id: 'channexId',
      propertyId: 'channex-property',
      name: 'name',
      adults: 2,
      children: 2,
      infants: 2,
      occupancy: 2,
      kind: 'room',
      description: 'description',
      totalRooms: units.filter((unit) => unit.propertyUnitTypeId === 1).length,
      photos: unitTypePhotos,
      facilities: unitTypeFacilities
        .filter((facility) => facility.propertyUnitTypeId === 1)
        .map((facility) => facility.channexId),
    })

    expect(upsertChannexRatePlan).toBeCalledWith({
      id: 'channexId',
      name: 'name',
      propertyId: 'channex-property',
      roomTypeId: 'channex-room-type',
      currency: 'EUR',
      options: [
        {
          occupancy: 1,
          rate: 10000,
          is_primary: true,
        },
        {
          occupancy: 2,
          rate: 10000,
          is_primary: false,
        },
      ],
    })
    expect(upsertChannexRatePlanRestriction).toBeCalledWith([
      {
        rates: [
          { occupancy: 1, rate: 10000 },
          { occupancy: 2, rate: 10000 },
        ],
        propertyId: 'channex-property',
        ratePlanId: 'channex-rate-plan',
        startDate: 'YYYY-MM-DD',
        endDate: 'YYYY-MM-DD',
      },
    ])
    expect(updateChannexAvailability).toBeCalledWith([
      {
        propertyId: 'channex-property',
        propertyUnitTypeId: 'channex-room-type',
        dateFrom: 'YYYY-MM-DD',
        dateTo: 'YYYY-MM-DD',
        availability: 1,
      },
    ])
    expect(upsertChannexRatePlanRestriction).toBeCalledWith([
      {
        id: 'channexId',
        propertyId: 'channex-property',
        ratePlanId: 'channex-rate-plan',
        startDate: 'date',
        endDate: 'date',
        rates: [
          { occupancy: 1, rate: 10000 },
          { occupancy: 2, rate: 10000 },
        ],
      },
    ])
    expect(updateUnitTypeRateSeasonsBy).toBeCalledWith(
      { id: 1, accountId },
      { channexId: 'channex-rate-plan-restriction' },
    )
    expect(updateUnitTypeRatesBy).toBeCalledWith(
      { id: 1, accountId },
      { channexId: 'channex-rate-plan' },
    )
    expect(updateUnitTypesBy).toBeCalledWith(
      { id: 1, propertyId },
      { channexId: 'channex-room-type' },
      trx,
    )
    expect(selectPropertyTaxesBy).toBeCalledWith({ propertyId })
    expect(selectPropertyTaxes).toBeCalledWith([
      'property_taxes.id as propertyTaxId',
      'taxes.*',
    ])
    expect(joinPropertyTaxes).toBeCalledWith(
      'taxes',
      'taxes.id',
      'property_taxes.tax_id',
    )
    expect(getTaxLogic).toBeCalledWith(propertyTaxes[0])
    expect(getTaxLogic).toBeCalledWith(propertyTaxes[1])
    expect(upsertChannexTax).toBeCalledWith({
      id: 'channexId',
      propertyId: 'channex-property',
      rate: 10,
      logic: 'logic',
      name: 'name',
      currency: 'EUR',
    })
    expect(updatePropertyTaxesBy).toBeCalledWith(
      { id: 1, propertyId },
      { channexId: 'channex-tax' },
      trx,
    )

    expect(getFeeLogic).toBeCalledWith(propertyFees[0])
    expect(getFeeLogic).toBeCalledWith(propertyFees[1])
    expect(upsertChannexFee).toBeCalledWith({
      id: 'channexId',
      propertyId: 'channex-property',
      rate: 10,
      logic: 'logic',
      name: 'name',
      currency: 'EUR',
    })
    expect(updatePropertyFeesBy).toBeCalledWith(
      { id: 1, propertyId },
      { channexId: 'channex-fee' },
      trx,
    )
    expect(updatePropertyChannelManagerBy).toBeCalledWith({
      accountId,
      propertyId,
      channelManagerAccountId: 1,
    }, { enabled: true }, trx)

    expect(sendStatus).toBeCalledWith(results)
  })

  it('should disable channel and create a property manager', async () => {
    const results = 200
    const trx = 'trx'

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(true)

    withAccount.mockImplementation(() => (queryBuilder) => queryBuilder)
    const selectChannels = jest.fn().mockResolvedValue({ channelManagerAccountId: 1 })
    const whereChannels = jest.fn().mockReturnValue({ select: selectChannels })
    selectChannelManagerBy.mockReturnValue({ where: whereChannels })
    raw.mockReturnValue('channel_manager_accounts.id AS channelManagerAccountId')

    selectPropertyChannelManagerBy.mockResolvedValue(false)

    const sendStatus = jest.fn().mockImplementation((args) => args)
    createTransaction.mockImplementation((fn) => fn(trx))

    await expect(httpHandler({
      body: { enabled: false },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: accountChannexId, settings },
    }, { sendStatus }))
      .resolves.toBe(results)

    expect(selectPropertyChannelManagerBy).toBeCalledWith({
      channelManagerAccountId: 1,
      accountId,
      propertyId,
    })
    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(withAccount).toBeCalledWith(accountId)
    expect(selectChannels).toBeCalledWith('channel_manager_accounts.id AS channelManagerAccountId')
    expect(whereChannels).toBeCalledWith('channel_managers.id', '=', channelId)
    expect(selectChannelManagerBy).toBeCalled()

    expect(createTransaction).toBeCalledWith(expect.any(Function))

    expect(deleteChannexProperty).toBeCalledWith(property.channexId)
    expect(updatePropertiesBy).toBeCalledWith({ id: propertyId }, { channexId: null })
    expect(updateUnitTypesBy).toBeCalledWith({ propertyId }, { channexId: null })
    expect(createPropertyChannelManager).toBeCalledWith({
      channelManagerAccountId: 1,
      enabled: false,
      accountId,
      propertyId,
    }, trx)
    expect(sendStatus).toBeCalledWith(results)
  })

  it('should throw an error if property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(null)

    await expect(httpHandler({
      body: { enabled: true },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: accountChannexId, settings },
    }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if property is not completed', async () => {
    const errorMessage = 'Not Completed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(false)

    await expect(httpHandler({
      body: { enabled: true },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: accountChannexId, settings },
    }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'NOT_COMPLETED' })
  })

  it('should throw an error if channexId is not passed', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(true)

    await expect(httpHandler({
      body: { enabled: true },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: null, settings },
    }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { channelId: ['notActivated'] },
    })
  })

  it('should throw an error if channel manager does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(true)

    withAccount.mockImplementation(() => (queryBuilder) => queryBuilder)
    const selectChannels = jest.fn().mockResolvedValue(null)
    const whereChannels = jest.fn().mockReturnValue({ select: selectChannels })
    selectChannelManagerBy.mockReturnValue({ where: whereChannels })
    raw.mockReturnValue('channel_manager_accounts.id AS channelManagerAccountId')

    await expect(httpHandler({
      body: { enabled: true },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: accountChannexId, settings },
    }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(withAccount).toBeCalledWith(accountId)
    expect(selectChannels).toBeCalledWith('channel_manager_accounts.id AS channelManagerAccountId')
    expect(whereChannels).toBeCalledWith('channel_managers.id', '=', channelId)
    expect(selectChannelManagerBy).toBeCalled()

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { channelId: ['notExists'] },
    })
  })

  it('should throw an error if channel manager account does not exist', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectProperty.mockResolvedValue(property)
    isPropertyCompleted.mockResolvedValue(true)

    withAccount.mockImplementation(() => (queryBuilder) => queryBuilder)
    const selectChannels = jest.fn().mockResolvedValue({ channelManagerAccountId: null })
    const whereChannels = jest.fn().mockReturnValue({ select: selectChannels })
    selectChannelManagerBy.mockReturnValue({ where: whereChannels })
    raw.mockReturnValue('channel_manager_accounts.id AS channelManagerAccountId')

    await expect(httpHandler({
      body: { enabled: true },
      params: { propertyId, channelId },
      user: { email, phoneNumber },
      account: { id: accountId, channexId: accountChannexId, settings },
    }))
      .rejects.toThrow(errorMessage)

    expect(selectProperty).toBeCalledWith({ id: propertyId, accountId })
    expect(isPropertyCompleted).toBeCalledWith(property)
    expect(withAccount).toBeCalledWith(accountId)
    expect(selectChannels).toBeCalledWith('channel_manager_accounts.id AS channelManagerAccountId')
    expect(whereChannels).toBeCalledWith('channel_managers.id', '=', channelId)
    expect(selectChannelManagerBy).toBeCalled()

    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: { channelId: ['disabled'] },
    })
  })
})
