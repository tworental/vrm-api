const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'propertyId',
  'serviceId',
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

exports.serialize = serialize
