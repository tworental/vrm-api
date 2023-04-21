const { excludeKeys } = require('../../../services/utility')
const { CANCELLATION_POLICIES } = require('../unit-type-rates/constants')
const { UPDATE_SCHEMA: RATE_SEASONS_SCHEMA } = require('../rate-seasons/schema')
const { SCHEMA: RATE_SEASONS_PRICE_SCHEMA } = require('../unit-type-rate-season-prices/schema')

const SCHEMA = {
  type: 'object',
  properties: {
    propertyUnitTypeRateId: {
      type: 'integer',
      minimum: 1,
    },
    rateSeasonId: {
      type: 'integer',
      nullable: true,
      minimum: 1,
    },
    startDate: {
      type: 'string',
      // format: 'date-time',
    },
    endDate: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/startDate',
      // },
    },
    pricesNightly: {
      type: 'array',
      minItems: 1,
      items: RATE_SEASONS_PRICE_SCHEMA,
    },
    discountDefault: {
      type: 'integer',
      enum: [0, 1],
    },
    minStayDefault: {
      type: 'integer',
      enum: [0, 1],
    },
    occupancyDefault: {
      type: 'integer',
      enum: [0, 1],
    },
    shortStayDefault: {
      type: 'integer',
      enum: [0, 1],
    },
    selfServiceRestrictionsDefault: {
      type: 'integer',
      enum: [0, 1],
    },
    cancellationPolicy: {
      type: 'string',
      enum: Object.values(CANCELLATION_POLICIES),
    },
    ...excludeKeys(RATE_SEASONS_SCHEMA.properties, [
      'currency',
      'priceNightly',
      'priceWeekdayMo',
      'priceWeekdayTu',
      'priceWeekdayWe',
      'priceWeekdayTh',
      'priceWeekdayFr',
      'priceWeekdaySa',
      'priceWeekdaySu',
    ]),
  },
}

exports.CREATE_SCHEMA = {
  type: 'object',
  required: [
    'propertyUnitTypeRateId',
    'name',
    'startDate',
    'endDate',
  ],
  properties: SCHEMA.properties,
}

exports.UPDATE_SCHEMA = SCHEMA
