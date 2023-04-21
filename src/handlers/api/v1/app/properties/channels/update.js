const createError = require('../../../../../../services/errors')
const dayjs = require('../../../../../../services/dayjs')
const { upsertSubscription } = require('../../../../../../services/channex')
const { CODES, MESSAGES } = require('../../../../../../services/errorCodes')
const { handler } = require('../../../../../../services/http')
const { raw, createTransaction } = require('../../../../../../services/database')
const {
  upsertProperty: upsertChannexProperty,
  upsertRoomType: upsertChannexRoomType,
  upsertRatePlan: upsertChannexRatePlan,
  upsertRatePlanRestriction: upsertChannexRatePlanRestriction,
  upsertTax: upsertChannexTax,
  upsertFee: upsertChannexFee,
  updateAvailability: updateChannexAvailability,
  deleteProperty: deleteChannexProperty,
} = require('../../../../../../services/channex')
const {
  selectOneBy: selectPropertyBy,
  updateBy: updatePropertiesBy,
  isPropertyCompleted,
} = require('../../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyTaxesBy,
  updateBy: updatePropertyTaxesBy,
} = require('../../../../../../models/v1/property-taxes/repositories')
const {
  TABLE_NAME: PROPERTY_TAXES_TABLE_NAME,
} = require('../../../../../../models/v1/property-taxes/constants')
const {
  TABLE_NAME: TAXES_TABLE_NAME,
  RATE_TYPES: TAXES_RATE_TYPES,
} = require('../../../../../../models/v1/taxes/constants')
const {
  getLogicType: getTaxLogic,
} = require('../../../../../../models/v1/taxes/repositories')
const {
  selectBy: selectPropertyFeesBy,
  updateBy: updatePropertyFeesBy,
} = require('../../../../../../models/v1/property-fees/repositories')
const {
  TABLE_NAME: PROPERTY_FEES_TABLE_NAME,
} = require('../../../../../../models/v1/property-fees/constants')
const {
  TABLE_NAME: FEES_TABLE_NAME,
  RATE_TYPES: FEES_RATE_TYPES,
} = require('../../../../../../models/v1/fees/constants')
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
const {
  TABLE_NAME: UNIT_TYPE_AMENITIES_TABLE_NAME,
} = require('../../../../../../models/v1/unit-type-amenities/constants')
const {
  TABLE_NAME: PROPERTY_AMENITIES_TABLE_NAME,
} = require('../../../../../../models/v1/property-amenities/constants')
const {
  TABLE_NAME: DICT_AMENITIES_TABLE_NAME,
} = require('../../../../../../models/v1/dict-amenities/constants')

module.exports = handler(async ({
  body: { enabled },
  params: { propertyId, channelId },
  user: { email, phoneNumber },
  account: { id: accountId, channexId, settings },
}, res) => {
  const property = await selectPropertyBy({ id: propertyId, accountId })

  if (!property) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  if (!await isPropertyCompleted(property)) {
    throw createError(422, MESSAGES.NOT_COMPLETED, { code: CODES.NOT_COMPLETED })
  }

  if (!channexId) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { channelId: ['notActivated'] },
    })
  }

  const channelManager = await withAccount(accountId)(
    selectChannelManagerBy(),
  ).where('channel_managers.id', '=', channelId)
    .select(raw('channel_manager_accounts.id AS channelManagerAccountId'))

  if (!channelManager) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { channelId: ['notExists'] },
    })
  }

  if (!channelManager.channelManagerAccountId) {
    throw createError(400, MESSAGES.VALIDATION_FAILED, {
      code: CODES.VALIDATION_FAILED,
      errors: { channelId: ['disabled'] },
    })
  }

  const propertyChannelManager = await selectPropertyChannelManagerBy({
    channelManagerAccountId: channelManager.channelManagerAccountId,
    accountId,
    propertyId,
  })

  const propertyChannelsEnabled = !!Number(enabled)

  await createTransaction(async (trx) => {
    if (propertyChannelsEnabled) {
      const unitTypeDefaultRates = await selectUnitTypeRatesBy({ propertyId, accountId }, trx)

      const unitTypeRatePrices = await selectUnitTypeRatePricesBy({ accountId }, trx)
        .whereIn('property_unit_type_rate_id', unitTypeDefaultRates.map((item) => item.id))

      const unitTypeSeasonRates = await selectUnitTypeRateSeasonsBy({ accountId }, trx)
        .whereRaw('end_date >= NOW()')
        .whereIn('property_unit_type_rate_id', unitTypeDefaultRates.map((item) => item.id))
      const unitTypeSeasonRatePrices = await selectUnitTypeRateSeasonPricesBy({ accountId }, trx)
        .whereIn('property_unit_type_rate_season_id', unitTypeSeasonRates.map((item) => item.id))

      const unitTypes = await selectUnitTypesBy({ propertyId }, trx).then((results) => results.map((item) => ({
        ...item, rates: unitTypeDefaultRates.filter((rate) => rate.propertyUnitTypeId === item.id),
      })))

      const units = await selectUnitsBy({ propertyId }, trx)

      const currency = unitTypeDefaultRates.length
        ? unitTypeDefaultRates[0].currency
        : settings.currency

      const propertyFacilities = await selectPropertyAmenitiesBy({ propertyId }, trx)
        .select([`${DICT_AMENITIES_TABLE_NAME}.channex_id`])
        .join(DICT_AMENITIES_TABLE_NAME, `${DICT_AMENITIES_TABLE_NAME}.id`, `${PROPERTY_AMENITIES_TABLE_NAME}.dict_amenity_id`)
        .whereRaw(`${DICT_AMENITIES_TABLE_NAME}.channex_id IS NOT NULL AND ${DICT_AMENITIES_TABLE_NAME}.channex_id != ''`)

      const unitTypeFacilities = await selectUnitTypeAmenitiesBy({}, trx)
        .select([`${DICT_AMENITIES_TABLE_NAME}.channex_id`])
        .join(DICT_AMENITIES_TABLE_NAME, `${DICT_AMENITIES_TABLE_NAME}.id`, `${UNIT_TYPE_AMENITIES_TABLE_NAME}.dict_amenity_id`)
        .whereIn('property_unit_type_id', unitTypes.map(({ id }) => id))
        .whereRaw(`${DICT_AMENITIES_TABLE_NAME}.channex_id IS NOT NULL AND ${DICT_AMENITIES_TABLE_NAME}.channex_id != ''`)

      const photos = await storageFiles(propertyId)

      /**
       * Sync property with Channex
       */
      const { data } = await upsertChannexProperty(channexId, {
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

      const { data: subscriptionData } = await upsertSubscription({
        id: property.channexSubscriptionId,
        propertyId: data.id,
      })

      await updatePropertiesBy(
        { id: propertyId, accountId }, { channexId: data.id, channexSubscriptionId: subscriptionData.id }, trx,
      )

      /**
       * Sync all unit types with channex
       */
      await Promise.all(
        unitTypes.map(async (unitType) => {
          const unitTypePhotos = await storageFiles(propertyId, unitType.id)

          const results = await upsertChannexRoomType({
            id: unitType.channexId,
            propertyId: data.id,
            name: unitType.name,
            adults: unitType.totalGuests, // TODO: unitType.maxAdults,
            children: unitType.maxChildren,
            infants: unitType.maxInfants,
            occupancy: unitType.totalGuests,
            kind: 'room',
            description: unitType.description,
            totalRooms: units.filter((unit) => unit.propertyUnitTypeId === unitType.id).length,
            photos: unitTypePhotos,
            facilities: unitTypeFacilities
              .filter((facility) => facility.propertyUnitTypeId === unitType.id)
              .map((facility) => facility.channexId),
          })

          await Promise.all(unitType.rates.map(async (rate) => {
            const options = unitTypeRatePrices
              .filter((ratePrice) => ratePrice.propertyUnitTypeRateId === rate.id)
              .sort((a, b) => a.occupancy - b.occupancy)
              .map((ratePrice, i) => ({
                occupancy: ratePrice.occupancy,
                rate: ratePrice.priceNightly * 100,
                is_primary: i === 0, // primary is first
              }))

            const { data: ratePlanData } = await upsertChannexRatePlan({
              id: rate.channexId,
              name: rate.name,
              propertyId: data.id,
              roomTypeId: results.data.id,
              currency: rate.currency,
              options,
            })

            await upsertChannexRatePlanRestriction([
              {
                rates: options.map((option) => ({
                  occupancy: option.occupancy,
                  rate: option.rate,
                })),
                propertyId: data.id,
                ratePlanId: ratePlanData.id,
                startDate: dayjs().format('YYYY-MM-DD'),
                endDate: dayjs().add(2, 'years').format('YYYY-MM-DD'),
              },
            ])
            // Availability: 1 is because 1 unit type can be booked at once.
            await updateChannexAvailability([
              {
                propertyId: data.id,
                propertyUnitTypeId: results.data.id,
                dateFrom: dayjs().format('YYYY-MM-DD'),
                dateTo: dayjs().add(2, 'year').format('YYYY-MM-DD'),
                availability: 1,
              },
            ])

            const seasonRates = unitTypeSeasonRates.filter((seasonRate) => (
              seasonRate.propertyUnitTypeId === unitType.id && seasonRate.propertyUnitTypeRateId === rate.id))
              .map(async (seasonRate) => {
                const rates = unitTypeSeasonRatePrices
                  .filter((ratePrice) => ratePrice.propertyUnitTypeRateSeasonId === seasonRate.id)
                  .sort((a, b) => a.occupancy - b.occupancy)
                  .map((ratePrice) => ({
                    occupancy: ratePrice.occupancy,
                    rate: ratePrice.priceNightly * 100,
                  }))

                const startDate = dayjs(seasonRate.startDate, 'YYYY-MM-DD').isBefore(dayjs())
                  ? dayjs().format('YYYY-MM-DD')
                  : seasonRate.startDate

                // TODO: https://docs.channex.io/guides/best-practices-guide#restriction-and-availability-updates
                const { data: [restrictionsData] } = await upsertChannexRatePlanRestriction([{
                  id: seasonRate.channexId,
                  propertyId: data.id,
                  ratePlanId: ratePlanData.id,
                  startDate,
                  endDate: seasonRate.endDate,
                  rates,
                }])

                return updateUnitTypeRateSeasonsBy(
                  { id: seasonRate.id, accountId }, { channexId: restrictionsData.id },
                )
              })

            await Promise.all(seasonRates)

            return updateUnitTypeRatesBy(
              { id: rate.id, accountId }, { channexId: ratePlanData.id },
            )
          }))

          return updateUnitTypesBy(
            { id: unitType.id, propertyId }, { channexId: results.data.id }, trx,
          )
        }),
      )

      /**
       * Sync all taxes with channex
       */
      const propertyTaxes = await selectPropertyTaxesBy({ propertyId })
        .select([
          `${PROPERTY_TAXES_TABLE_NAME}.id as propertyTaxId`,
          `${TAXES_TABLE_NAME}.*`,
        ])
        .join(TAXES_TABLE_NAME, `${TAXES_TABLE_NAME}.id`, `${PROPERTY_TAXES_TABLE_NAME}.tax_id`)

      await Promise.all(propertyTaxes.map(async (tax) => {
        const { data: taxData } = await upsertChannexTax({
          id: tax.channexId,
          propertyId: data.id,
          rate: tax.rateType === TAXES_RATE_TYPES.PERCENTAGE ? tax.percentage : tax.amount,
          logic: getTaxLogic(tax),
          name: tax.name,
          currency: tax.currency,
        })

        return updatePropertyTaxesBy({ id: tax.propertyTaxId, propertyId }, { channexId: taxData.id }, trx)
      }))

      /**
       * Sync all fees with channex
       */
      const propertyFees = await selectPropertyFeesBy({ propertyId })
        .select([
          `${PROPERTY_FEES_TABLE_NAME}.id as propertyFeeId`,
          `${FEES_TABLE_NAME}.*`,
        ])
        .join(FEES_TABLE_NAME, `${FEES_TABLE_NAME}.id`, `${PROPERTY_FEES_TABLE_NAME}.fee_id`)

      await Promise.all(propertyFees.map(async (fee) => {
        const { data: feeData } = await upsertChannexFee({
          id: fee.channexId,
          propertyId: data.id,
          rate: fee.rateType === FEES_RATE_TYPES.PERCENTAGE ? fee.percentage : fee.amount,
          logic: getFeeLogic(fee),
          name: fee.name,
          currency: fee.currency,
        })

        return updatePropertyFeesBy({ id: fee.propertyFeeId, propertyId }, { channexId: feeData.id }, trx)
      }))
    } else {
      await deleteChannexProperty(property.channexId)

      await updatePropertiesBy({ id: propertyId }, { channexId: null })
      await updateUnitTypesBy({ propertyId }, { channexId: null })
    }

    if (propertyChannelManager) {
      await updatePropertyChannelManagerBy({
        accountId, propertyId, channelManagerAccountId: channelManager.channelManagerAccountId,
      }, { enabled: propertyChannelsEnabled }, trx)
    } else {
      await createPropertyChannelManager({
        channelManagerAccountId: channelManager.channelManagerAccountId,
        enabled: propertyChannelsEnabled,
        accountId,
        propertyId,
      }, trx)
    }
  })

  return res.sendStatus(200)
})
