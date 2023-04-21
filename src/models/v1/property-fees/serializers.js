const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'propertyId',
  'feeId',
  'name',
  'rateType',
  'percentage',
  'currency',
  'amount',
  'chargeType',
  'frequency',
  'description',
  'createdAt',
  'updatedAt',
]

exports.serialize = serialize
