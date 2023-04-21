const SCHEMA = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      maxLength: 191,
      nullable: true,
      transform: ['trim'],
    },
    description: {
      type: 'string',
      maxLength: 1024,
      nullable: true,
      transform: ['trim'],
    },
    propertyId: {
      type: 'integer',
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
    main: {
      type: 'integer',
      enum: [1],
    },
    position: {
      type: 'integer',
      minimum: 0,
    },
  },
}

exports.CREATE_SCHEMA = {
  type: 'object',
  required: ['propertyId'],
  properties: SCHEMA.properties,
}

exports.UPDATE_SCHEMA = SCHEMA

exports.MOVE_SCHEMA = {
  type: 'object',
  properties: {
    newIndex: {
      type: 'integer',
      minimum: 0,
    },
    oldIndex: {
      type: 'integer',
      minimum: 0,
    },
  },
}
