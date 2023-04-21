const { TIME_UNITS, EVENT_TYPES } = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    time: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
    },
    timeUnit: {
      type: 'string',
      enum: Object.values(TIME_UNITS),
    },
    eventType: {
      type: 'string',
      enum: Object.values(EVENT_TYPES),
    },
    reminderSms: {
      type: 'integer',
      enum: [0, 1],
    },
    reminderEmail: {
      type: 'integer',
      enum: [0, 1],
    },
    phoneNumber: {
      type: 'string',
      nullable: true,
      maxLength: 40,
      transform: ['trim'],
    },
    email: {
      type: 'string',
      nullable: true,
      maxLength: 191,
      transform: ['trim', 'toLowerCase'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'time',
    'timeUnit',
    'eventType',
    'reminderSms',
    'reminderEmail',
  ],
  properties: SCHEMA.properties,
}

exports.UPDATE_SCHEMA = SCHEMA
