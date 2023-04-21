const dayjs = require('../../../services/dayjs')
const {
  STATUSES, CANCELED_BY,
} = require('./constants')

const CURRENT_DATE = new Date().toISOString().slice(0, 10)

const SCHEMA = {
  type: 'object',
  properties: {
    propertyId: {
      type: 'integer',
      minimum: 1,
    },
    propertyUnitTypeId: {
      type: 'integer',
      minimum: 1,
    },
    propertyUnitTypeUnitId: {
      type: 'integer',
      minimum: 1,
    },
    dateArrival: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: CURRENT_DATE,
    },
    dateDeparture: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/dateArrival',
      // },
    },
    checkinAt: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/dateArrival',
      // },
    },
    checkoutAt: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/checkinAt',
      // },
    },
    dateConfirmed: {
      type: 'string',
      // format: 'date-time',
      nullable: true,
      // formatMinimum: CURRENT_DATE,
      // formatMaximum: {
      //   $data: '1/dateDeparture',
      // },
    },
    dateCanceled: {
      type: 'string',
      // format: 'date-time',
      nullable: true,
      // formatMinimum: CURRENT_DATE,
      // formatMaximum: {
      //   $data: '1/dateDeparture',
      // },
    },
    optionExpirationDate: {
      type: 'string',
      // format: 'date-time',
      nullable: true,
      // formatMinimum: CURRENT_DATE,
      // formatMaximum: {
      //   $data: '1/dateArrival',
      // },
    },
    guestsAdults: {
      type: 'integer',
      default: 2,
      minimum: 0,
      maximum: 20,
    },
    guestsChildren: {
      type: 'integer',
      default: 0,
      minimum: 0,
      maximum: 20,
    },
    guestsTeens: {
      type: 'integer',
      default: 0,
      minimum: 0,
      maximum: 20,
    },
    guestsInfants: {
      type: 'integer',
      default: 0,
      minimum: 0,
      maximum: 20,
    },
    status: {
      type: 'string',
      enum: [
        STATUSES.DRAFT,
        STATUSES.TENTATIVE,
        STATUSES.CONFIRMED,
        STATUSES.CANCELED,
        STATUSES.DECLINED,
      ],
    },
    canceledBy: {
      type: 'string',
      enum: Object.values(CANCELED_BY),
      nullable: true,
    },
    channelName: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    channelCommission: {
      type: 'number',
      nullable: true,
      minimum: 0,
      maximum: 100,
    },
    amountDiscount: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    amountAccommodationDue: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    amountSecureDeposited: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    promoCode: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    source: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    notes: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'propertyId',
    'propertyUnitTypeId',
    'propertyUnitTypeUnitId',
    'dateArrival',
    'dateDeparture',
    'amountAccommodationDue',
  ],
  ...SCHEMA,
}

exports.CREATE_ONLY_UNIT_SCHEMA = {
  required: [
    'dateArrival',
    'dateDeparture',
    'amountAccommodationDue',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA

exports.AVAILABILITY_SCHEMA = {
  type: 'object',
  required: [
    'propertyId',
    'dateArrival',
    'dateDeparture',
    'guests',
  ],
  properties: {
    bookingId: {
      type: 'integer',
      nullable: true,
      default: null,
      minimum: 1,
    },
    propertyUnitTypeId: {
      type: 'integer',
      nullable: true,
      minimum: 1,
    },
    propertyUnitTypeUnitId: {
      type: 'integer',
      nullable: true,
      minimum: 1,
    },
    propertyId: {
      type: 'integer',
      minimum: 1,
    },
    dateArrival: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: CURRENT_DATE,
    },
    dateDeparture: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/dateArrival',
      // },
    },
    guests: {
      type: 'integer',
      minimum: 1,
      maximum: 20,
    },
  },
}

exports.UNIT_AVAILABILITY_SCHEMA = {
  type: 'object',
  required: [
    'dateArrival',
    'dateDeparture',
    'guests',
  ],
  properties: {
    dateArrival: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: CURRENT_DATE,
    },
    dateDeparture: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/dateArrival',
      // },
    },
    guests: {
      type: 'integer',
      minimum: 1,
      maximum: 20,
    },
  },
}

exports.FETCH_LIST_SCHEMA = {
  type: 'object',
  properties: {
    currentPage: {
      type: 'integer',
      default: 1,
      minimum: 1,
    },
    perPage: {
      type: 'integer',
      default: 25,
      minimum: 1,
    },
    priceMin: {
      type: 'integer',
      default: 0,
      minimum: 0,
    },
    priceMax: {
      type: 'integer',
      default: 100000000,
      minimum: {
        $data: '1/priceMin',
      },
    },
    startDate: {
      type: 'string',
      // format: 'date-time',
      default: dayjs(CURRENT_DATE).startOf('month'),
    },
    endDate: {
      type: 'string',
      // format: 'date-time',
      // formatMinimum: {
      //   $data: '1/startDate',
      // },
      default: dayjs(CURRENT_DATE).endOf('month'),
    },
    propertyIds: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1,
      },
    },
    propertyUnitTypeIds: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1,
      },
    },
    propertyUnitTypeUnitIds: {
      type: 'array',
      items: {
        type: 'integer',
        minimum: 1,
      },
    },
    statuses: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(STATUSES),
      },
    },
  },
}
