const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'name',
  'isCompleted',
  'priceNightly',
  'currency',
  'minStayDays',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = ['*']

exports.serialize = serialize
