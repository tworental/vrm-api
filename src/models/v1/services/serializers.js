const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'serviceProviderId',
  'serviceProviderName',
  'name',
  'duration',
  'type',
  'description',
  'currency',
  'amount',
  'chargeType',
  'taxIncluded',
  'taxValue',
  'totalReminders',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = [
  'id',
  'serviceProviderId',
  'name',
  'duration',
  'type',
  'description',
  'currency',
  'amount',
  'chargeType',
  'taxIncluded',
  'taxValue',
  'createdAt',
  'updatedAt',
]

exports.serialize = serialize
