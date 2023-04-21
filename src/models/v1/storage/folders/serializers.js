const { serialize } = require('../../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'userId',
  'folderId',
  'uuid',
  'name',
  'pinned',
  'starred',
  'system',
  'hidden',
  'labels',
  'createdAt',
  'updatedAt',
  'deletedAt',
]

exports.PERMITED_ITEM_PARAMS = exports.PERMITED_COLLECTION_PARAMS

exports.serialize = serialize
