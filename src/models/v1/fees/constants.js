exports.TABLE_NAME = 'fees'

exports.RATE_TYPES = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
})

exports.CHARGE_TYPE = Object.freeze({
  SINGLE_CHARGE: 'singleCharge',
  PER_PERSON: 'perPerson',
})

exports.FREQUENCIES = Object.freeze({
  PER_STAY: 'perStay',
  PER_NIGHT: 'perNight',
})
