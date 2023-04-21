const { DEFAULT_GUESTS, PRIVACY, AREA_UNITS } = require('./constants')
const { SCHEMA: UNIT_TYPE_ARRANGEMENTS_SCHEMA } = require('../unit-type-arrangements/schema')
const { SCHEMA: UNIT_TYPE_AMENITIES_SCHEMA } = require('../unit-type-amenities/schema')

const SCHEMA = {
  type: 'object',
  properties: {
    dictGuestTypeId: {
      type: 'number',
      nullable: true,
      minimum: 1,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    description: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    area: {
      type: 'number',
    },
    areaUnit: {
      type: 'string',
      enum: Object.values(AREA_UNITS),
    },
    totalGuests: {
      type: 'number',
      minimum: 1,
      maximum: 50,
    },
    maxAdults: {
      type: 'number',
      minimum: 1,
      maximum: {
        $data: '1/totalGuests',
      },
    },
    maxChildren: {
      type: 'number',
      minimum: 0,
      maximum: {
        $data: '1/totalGuests',
      },
    },
    maxInfants: {
      type: 'number',
      minimum: 0,
      maximum: {
        $data: '1/totalGuests',
      },
    },
    privacy: {
      type: 'string',
      enum: Object.values(PRIVACY),
    },
    color: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      transform: ['trim'],
    },
    amenities: {
      type: 'array',
      nullable: true,
      items: UNIT_TYPE_AMENITIES_SCHEMA,
    },
    arrangements: {
      type: 'array',
      nullable: true,
      items: UNIT_TYPE_ARRANGEMENTS_SCHEMA,
    },
  },
}

exports.CREATE_SCHEMA = {
  type: 'object',
  required: [
    'name',
  ],
  properties: {
    ...SCHEMA.properties,
    unitsNo: {
      type: 'number',
      default: 1,
      minimum: 1,
    },
    totalGuests: {
      ...SCHEMA.properties.totalGuests,
      default: DEFAULT_GUESTS,
    },
  },
}

exports.UPDATE_SCHEMA = SCHEMA
