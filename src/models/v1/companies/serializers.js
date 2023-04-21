const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'name',
  'type',
  'isActive',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = [
  'id',
  'name',
  'type',
  'vatId',
  'registrationNumber',
  'taxId',
  'bankName',
  'bankIban',
  'bankBic',
  'email',
  'phoneNumber',
  'address',
  'city',
  'zip',
  'region',
  'countryCode',
  'discountType',
  'discountValue',
  'isActive',
  'labels',
  'notes',
  'createdAt',
  'updatedAt',
]

exports.serialize = serialize
