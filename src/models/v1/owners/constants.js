exports.TABLE_NAME = 'owners'

exports.GENDERS = Object.freeze({
  MALE: 'm',
  FEMALE: 'f',
})

exports.DOCUMENT_TYPES = Object.freeze({
  ID: 'idCard',
  PASSPORT: 'passport',
  DRIVING_LICENSE: 'drivingLicense',
})

exports.EMAIL_TEMPLATES = Object.freeze({
  REQUEST_RESET_PASSWORD: 'owners-request-reset-password',
  APP_INVITATION: 'owners-app-invitation',
  OWNER_LOCKED: 'owners-locked',
  OWNER_UNLOCKED: 'owners-unlocked',
})

exports.AVATARS_S3_DIR = 'owners'
