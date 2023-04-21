exports.TABLE_NAME = 'service_reminders'

exports.TIME_UNITS = Object.freeze({
  MINUTES: 'minutes',
  HOURS: 'hours',
  DAYS: 'days',
  WEEKS: 'weeks',
  MONTHS: 'months',
})

exports.EVENT_TYPES = Object.freeze({
  BEFORE_SERVICE: 'beforeService',
  AFTER_SERVICE: 'afterService',
  BEFORE_CHECK_IN: 'beforeCheckIn',
  AFTER_CHECK_IN: 'afterCheckIn',
  BEFORE_CHECK_OUT: 'beforeCheckOut',
  AFTER_CHECK_OUT: 'afterCheckOut',
})
