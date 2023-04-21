const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'propertyId',
  'dictGuestTypeId',
  'unitsNo',
  'name',
  'area',
  'areaUnit',
  'totalGuests',
  'privacy',
  'isCompleted',
  'isActive',
  'color',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = [
  'id',
  'propertyId',
  'dictGuestTypeId',
  'unitsNo',
  'name',
  'area',
  'areaUnit',
  'totalGuests',
  'privacy',
  'isCompleted',
  'isActive',
  'color',
  'description',
  'arrangements',
  'amenities',
  'completeness',
  'createdAt',
  'updatedAt',
]

exports.serialize = serialize
