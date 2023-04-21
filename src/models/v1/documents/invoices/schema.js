const {
  PAYMENT_TYPES,
  TAX_NOTATIONS,
  INVOICE_TYPES,
  INVOICE_STATUSES,
} = require('./constants')

const SCHEMA = {
  type: 'object',
  properties: {
    invoiceId: {
      type: 'number',
    },
    invoiceNo: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
    status: {
      type: 'string',
      enum: Object.values(INVOICE_STATUSES),
    },
    invoiceType: {
      type: 'string',
      enum: Object.values(INVOICE_TYPES),
    },
    logoBase64: {
      type: 'string',
    },
    invoiceDate: {
      type: 'string',
      format: 'date',
    },
    invoiceDueDate: {
      type: 'string',
      format: 'date',
    },
    invoiceNote: {
      type: 'string',
      transform: ['trim'],
    },
    invoiceItems: {
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      items: {
        type: 'object',
        required: [
          'name',
          'quantity',
          'tax',
          'price',
        ],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 191,
            transform: ['trim'],
          },
          quantity: {
            type: 'number',
          },
          discount: {
            type: 'number',
          },
          tax: {
            type: 'number',
            minimum: 0,
            maximum: 100,
          },
          price: {
            type: 'number',
          },
        },
      },
    },
    sellerName: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    sellerAddress: {
      type: 'string',
      maxLength: 191,
      transform: ['trim'],
    },
    sellerZip: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
    sellerCity: {
      type: 'string',
      maxLength: 100,
      transform: ['trim'],
    },
    sellerCountry: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    sellerTaxId: {
      type: 'string',
      maxLength: 60,
      transform: ['trim'],
    },
    buyerName: {
      type: 'string',
      minLength: 2,
      maxLength: 191,
      transform: ['trim'],
    },
    buyerAddress: {
      type: 'string',
      maxLength: 191,
      transform: ['trim'],
    },
    buyerZip: {
      type: 'string',
      maxLength: 40,
      transform: ['trim'],
    },
    buyerCity: {
      type: 'string',
      maxLength: 100,
      transform: ['trim'],
    },
    buyerCountry: {
      type: 'string',
      minLength: 2,
      maxLength: 2,
      transform: ['trim'],
    },
    buyerTaxId: {
      type: 'string',
      maxLength: 60,
      transform: ['trim'],
    },
    paymentType: {
      type: 'string',
      enum: Object.values(PAYMENT_TYPES),
    },
    taxNotation: {
      type: 'string',
      enum: Object.values(TAX_NOTATIONS),
    },
    isPaid: {
      type: 'number',
      enum: [0, 1],
    },
    currency: {
      type: 'string',
      minLength: 3,
      maxLength: 3,
      transform: ['trim'],
    },
  },
}

exports.CREATE_SCHEMA = {
  required: [
    'invoiceNo',
    'status',
    'invoiceType',
    'invoiceDate',
    'invoiceDueDate',
    'invoiceItems',
    'sellerName',
    'sellerAddress',
    'sellerZip',
    'sellerCity',
    'sellerCountry',
    'buyerName',
    'buyerAddress',
    'buyerZip',
    'buyerCity',
    'buyerCountry',
    'paymentType',
    'taxNotation',
    'currency',
  ],
  ...SCHEMA,
}

exports.UPDATE_SCHEMA = SCHEMA
