const SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    email: {
      type: 'string',
      nullable: true,
      format: 'email',
      transform: ['trim', 'toLowerCase'],
    },
    phoneNumber: {
      type: 'string',
      minLength: 5,
      maxLength: 40,
      transform: ['trim'],
    },
    companyName: {
      type: 'string',
      maxLength: 191,
      transform: ['trim'],
    },
    companyAddress: {
      type: 'string',
      nullable: true,
      maxLength: 191,
      transform: ['trim'],
    },
    contactPerson: {
      type: 'string',
      nullable: true,
      maxLength: 191,
      transform: ['trim'],
    },
    description: {
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
    'name',
    'phoneNumber',
    'companyName',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
