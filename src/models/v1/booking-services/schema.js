const SCHEMA = {
  type: 'object',
  properties: {
    propertyServiceId: {
      type: 'integer',
      minimum: 1,
    },
    quantity: {
      type: 'integer',
      minimum: 1,
    },
    startDate: {
      type: 'string',
      // format: 'date-time',
      nullable: true,
    },
    startTime: {
      type: 'string',
      // format: 'time',
      nullable: true,
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'propertyServiceId',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
