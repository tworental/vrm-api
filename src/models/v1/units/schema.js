const { STATUSES, PRIORITIES } = require('./constants')
const { AREA_UNITS } = require('../unit-types/constants')
const { SCHEMA: UNIT_TYPE_ARRANGEMENTS_SCHEMA } = require('../unit-type-arrangements/schema')
const { SCHEMA: UNIT_TYPE_AMENITIES_SCHEMA } = require('../unit-type-amenities/schema')

const SCHEMA = {
  type: 'object',
  properties: {
    ownerId: {
      type: 'integer',
      minimum: 1,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    status: {
      type: 'string',
      enum: Object.values(STATUSES),
    },
    priority: {
      type: 'string',
      enum: Object.values(PRIORITIES),
    },
    isActive: {
      type: 'integer',
      enum: [0, 1],
    },
    floor: {
      type: 'number',
      nullable: true,
      minimum: -5,
      maximum: 1000,
    },
    area: {
      type: 'number',
      minimum: 0,
    },
    areaUnit: {
      type: 'string',
      enum: Object.values(AREA_UNITS),
    },
    color: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
    },
    outOfService: {
      type: 'object',
      nullable: true,
      required: [
        'start_date',
        'end_date',
      ],
      properties: {
        startDate: {
          type: 'string',
          // format: 'date-time',
        },
        endDate: {
          type: 'string',
          // format: 'date-time',
        },
        notes: {
          type: 'string',
          nullable: true,
          transform: ['trim'],
        },
      },
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
    status: {
      ...SCHEMA.properties.status,
      default: STATUSES.ACTIVE,
    },
  },
}

exports.UPDATE_SCHEMA = SCHEMA
