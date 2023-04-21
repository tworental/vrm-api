const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'email',
  'phoneNumber',
  'firstName',
  'lastName',
  'gender',
  'birthDate',
  'citizenship',
  'residence',
  'documentType',
  'documentNumber',
  'agencyCommission',
  'hasPanelAccess',
  'hasOnboardingEnabled',
  'parlance',
  'notes',
  'lastSignInAt',
  'lockedAt',
  'confirmedAt',
  'phoneNumberVerifiedAt',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = exports.PERMITED_COLLECTION_PARAMS

exports.serialize = serialize
