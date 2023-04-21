const { serialize } = require('../../../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'invoiceNoPattern',
]

exports.PERMITED_ITEM_PARAMS = [
  'id',
  'invoiceNoPattern',
]

exports.serialize = serialize
