const { DISCOUNT_TYPES } = require('../unit-type-rates/constants')

const SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    priceNightly: {
      type: 'number',
      minimum: 0,
    },
    priceWeekdayEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    priceWeekdayMo: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayTu: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayWe: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayTh: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayFr: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdaySa: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdaySu: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    discountEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    discountType: {
      type: 'string',
      nullable: true,
      enum: Object.values(DISCOUNT_TYPES),
    },
    discountWeekly: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    discountMonthly: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    discountCustomEnabled: {
      type: 'integer',
      nullable: true,
      enum: [0, 1, null],
    },
    discountCustom: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    discountCustomPeriod: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayDays: {
      type: 'integer',
      nullable: true,
      minimum: 0,
      maximum: 1000,
    },
    minStayWeekdayEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    minStayWeekdayMo: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayWeekdayTu: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayWeekdayWe: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayWeekdayTh: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayWeekdayFr: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayWeekdaySa: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    minStayWeekdaySu: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    occupancyEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    occupancyStartsAfterPerson: {
      type: 'integer',
      nullable: true,
      minimum: 0,
    },
    occupancyExtraCharge: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    shortStayEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    shortStayDays: {
      type: 'integer',
      nullable: true,
      minimum: 0,
    },
    shortStayExtraCharge: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    selfServiceRestrictionsEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    selfServiceCheckinMo: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckinTu: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckinWe: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckinTh: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckinFr: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckinSa: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckinSu: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutMo: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutTu: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutWe: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutTh: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutFr: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutSa: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    selfServiceCheckoutSu: {
      type: 'integer',
      nullable: true,
      enum: [0, 1],
    },
    notesEnabled: {
      type: 'integer',
      enum: [0, 1],
    },
    notes: {
      type: 'string',
      nullable: true,
    },
  },
}

exports.CREATE_SCHEMA = {
  type: 'object',
  required: [
    'name',
  ],
  properties: SCHEMA.properties,
}

exports.UPDATE_SCHEMA = SCHEMA
