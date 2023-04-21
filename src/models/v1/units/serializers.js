const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'propertyId',
  'propertyUnitTypeId',
  'ownerId',
  'isActive',
  'isCompleted',
  'status',
  'priority',
  'name',
  'floor',
  'area',
  'areaUnit',
  'color',
  'outOfService',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = exports.PERMITED_COLLECTION_PARAMS

exports.serialize = serialize
