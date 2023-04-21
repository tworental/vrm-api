exports.TABLE_NAME = 'users'

exports.EMAIL_TEMPLATES = Object.freeze({
  REQUEST_RESET_PASSWORD: 'users-request-reset-password',
  ACCOUNT_CONFIRMATION: 'users-account-confirmation',
  TEAM_INVITATION: 'users-team-invitation',
  CHANGE_ACCOUNT_OWNER: 'users-change-account-owner',
  USER_LOCKED: 'users-locked',
  USER_UNLOCKED: 'users-unlocked',
  REMINDERS_BEFORE_SERVICE: 'reminders-before-service',
  REMINDERS_AFTER_SERVICE: 'reminders-after-service',
  REMINDERS_BEFORE_CHECKIN: 'reminders-before-checkin',
  REMINDERS_AFTER_CHECKIN: 'reminders-after-checkin',
  REMINDERS_BEFORE_CHECKOUT: 'reminders-before-checkout',
  REMINDERS_AFTER_CHECKOUT: 'reminders-after-checkout',
})

exports.AVATARS_S3_DIR = 'users'
