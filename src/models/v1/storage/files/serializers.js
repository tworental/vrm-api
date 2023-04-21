const { serialize } = require('../../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'folderId',
  'uuid',
  'originalFileName',
  'size',
  'ext',
  'path',
  'starred',
  'labels',
  'notes',
  'mimeType',
  'createdAt',
  'updatedAt',
  'deletedAt',
]

exports.PERMITED_ITEM_PARAMS = exports.PERMITED_COLLECTION_PARAMS

exports.serialize = serialize
