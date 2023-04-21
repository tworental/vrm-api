const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'bookingId',
  'name',
  'description',
  'rateType',
  'percentage',
  'currency',
  'amount',
  'chargeType',
  'frequency',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = exports.PERMITED_COLLECTION_PARAMS

exports.serialize = serialize
