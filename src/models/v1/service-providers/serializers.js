const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'name',
  'email',
  'phoneNumber',
  'companyName',
  'contactPerson',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = [
  'id',
  'name',
  'email',
  'phoneNumber',
  'companyName',
  'companyAddress',
  'contactPerson',
  'description',
  'notes',
  'createdAt',
  'updatedAt',
]

exports.serialize = serialize
