const { MEASURING_UNITS, TIME_FORMATS, DATE_FORMATS } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    locale: {
      type: 'string',
      minLength: 2,
      maxLength: 6,
      transform: ['trim'],
    },
    timezone: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      transform: ['trim'],
    },
    language: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    countryCode: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    measuringUnits: {
      type: 'string',
      enum: Object.values(MEASURING_UNITS),
    },
    dateFormat: {
      type: 'string',
      nullable: true,
      enum: [...Object.values(DATE_FORMATS), ''],
    },
    timeFormat: {
      type: 'string',
      enum: Object.values(TIME_FORMATS),
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {}

exports.UPDATE_SCHEMA = SCHEMA
