exports.TABLE_NAME = 'property_unit_type_rates'

exports.DEFAULT_RATE_NAME = 'Default Rate'

exports.MIN_STAY_DAYS_DEFAULT = 1

exports.DAYS_IN_WEEK = 7
exports.DAYS_IN_MONTH = 30

exports.DISCOUNT_TYPES = Object.freeze({
  // PERCENTAGE: 'percentage',
  AMOUNT: 'amount',
})

exports.CANCELLATION_POLICIES = Object.freeze({
  NON_REFUNDABLE: 'nonRefundable',
  FREE_CANCELLATION_POLICY: 'freeCancellationPolicy',
})
