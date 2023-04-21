exports.TABLE_NAME = 'user_tokens'

exports.TOKEN_EXPIRES_TIME = 86400000

exports.TOKEN_TYPES = Object.freeze({
  RESET: 'reset',
  UNLOCK: 'unlock',
  CONFIRMATION: 'confirmation',
  PHONE_VERIFICATION: 'phoneVerification',
})
