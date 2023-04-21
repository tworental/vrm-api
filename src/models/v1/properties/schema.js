const { DISTANCE_TYPES } = require('./constants')
const { SCHEMA: PROPERTY_AMENTITIES_SCHEMA } = require('../property-amenities/schema')
const { UPDATE_SCHEMA: UNIT_TYPES_SCHEMA } = require('../unit-types/schema')
const { UPDATE_SCHEMA: UNITS_SCHEMA } = require('../units/schema')

exports.CREATE_SCHEMA = {
  type: 'object',
  required: [
    'name',
    'multipleUnitTypes',
  ],
  properties: {
    dictPropertyTypeId: {
      type: 'integer',
      minimum: 1,
    },
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 100,
      transform: ['trim'],
    },
    multipleUnitTypes: {
      type: 'number',
      enum: [0, 1],
      default: 0,
    },
  },
}

exports.UPDATE_SCHEMA = {
  type: 'object',
  properties: {
    dictPropertyTypeId: {
      type: 'integer',
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
    checkinTime: {
      type: 'string',
      pattern: '[0-9]{2}:[0-9]{2}',
    },
    checkoutTime: {
      type: 'string',
      pattern: '[0-9]{2}:[0-9]{2}',
    },
    registrationNumber: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    internalCode: {
      type: 'string',
      nullable: true,
      transform: ['trim'],
    },
    isAddressPublic: {
      type: 'integer',
      enum: [0, 1],
    },
    languages: {
      type: 'array',
      items: {
        type: 'string',
        transform: ['trim'],
        minLength: 2,
        maxLength: 2,
      },
    },
    directions: {
      type: 'string',
      nullable: true,
    },
    coordinates: {
      type: 'object',
      nullable: true,
      required: ['lat', 'lng'],
      properties: {
        lat: {
          type: 'number',
          minimum: -90.00,
          maximum: 90.00,
        },
        lng: {
          type: 'number',
          minimum: -180.00,
          maximum: 180.00,
        },
      },
    },
    distances: {
      type: 'object',
      properties: {
        unit: {
          type: 'string',
          enum: Object.values(DISTANCE_TYPES),
        },
        train: {
          type: 'number',
          nullable: true,
          minimum: 0,
          maximum: 1000,
        },
        motorway: {
          type: 'number',
          nullable: true,
          minimum: 0,
          maximum: 1000,
        },
        bus: {
          type: 'number',
          nullable: true,
          minimum: 0,
          maximum: 1000,
        },
        underground: {
          type: 'number',
          nullable: true,
          minimum: 0,
          maximum: 1000,
        },
        airport: {
          type: 'number',
          nullable: true,
          minimum: 0,
          maximum: 1000,
        },
        port: {
          type: 'number',
          nullable: true,
          minimum: 0,
          maximum: 1000,
        },
      },
    },
    address: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          transform: ['trim'],
        },
        countryIsoCode: {
          type: 'string',
          nullable: true,
          minLength: 2,
          maxLength: 2,
          transform: ['trim'],
        },
        city: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          transform: ['trim'],
        },
        cityPlaceId: {
          type: 'string',
          nullable: true,
          maxLength: 255,
          transform: ['trim'],
        },
        stateProvince: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          transform: ['trim'],
        },
        street1: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          transform: ['trim'],
        },
        street2: {
          type: 'string',
          nullable: true,
          maxLength: 100,
          transform: ['trim'],
        },
        zipCode: {
          type: 'string',
          nullable: true,
          maxLength: 20,
          transform: ['trim'],
        },
        formattedAddress: {
          type: 'string',
          nullable: true,
          transform: ['trim'],
        },
        manualAddress: {
          type: 'number',
          enum: [0, 1],
          default: 0,
        },
      },
    },
    amenities: {
      type: 'array',
      nullable: true,
      items: PROPERTY_AMENTITIES_SCHEMA,
    },
    arrangements: UNIT_TYPES_SCHEMA.properties.arrangements,
    area: UNIT_TYPES_SCHEMA.properties.area,
    areaUnit: UNIT_TYPES_SCHEMA.properties.areaUnit,
    totalGuests: UNIT_TYPES_SCHEMA.properties.totalGuests,
    maxAdults: UNIT_TYPES_SCHEMA.properties.maxAdults,
    maxChildren: UNIT_TYPES_SCHEMA.properties.maxChildren,
    maxInfants: UNIT_TYPES_SCHEMA.properties.maxInfants,
    status: UNITS_SCHEMA.properties.status,
    isActive: UNITS_SCHEMA.properties.isActive,
    floor: UNITS_SCHEMA.properties.floor,
  },
}
