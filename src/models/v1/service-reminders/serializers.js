const { serialize } = require('../../../services/serializers')

exports.PERMITED_COLLECTION_PARAMS = [
  'id',
  'serviceId',
  'time',
  'timeUnit',
  'eventType',
  'reminderSms',
  'reminderEmail',
  'phoneNumber',
  'email',
  'createdAt',
  'updatedAt',
]

exports.PERMITED_ITEM_PARAMS = [
  'id',
  'serviceId',
  'time',
  'timeUnit',
  'eventType',
  'reminderSms',
  'reminderEmail',
  'phoneNumber',
  'email',
  'createdAt',
  'updatedAt',
]

exports.serialize = serialize
