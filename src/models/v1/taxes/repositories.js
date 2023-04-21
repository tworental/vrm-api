const dao = require('../../../services/dao')

const {
  TABLE_NAME,
  RATE_TYPES,
  CHARGE_TYPE,
  FREQUENCIES,
} = require('./constants')

/*
* RATE_TYPES.PERCENTAGE = percent
* SINGLE_CHARGE x PER_NIGHT = per_room_per_night
* SINGLE_CHARGE x PER_STAY = per_booking
* PER_PERSON x PER_NIGHT = per_person_per_night
* PER_PERSON x PER_STAY = per_person
* */
const getLogicType = (tax) => {
  if (tax.rateType === RATE_TYPES.PERCENTAGE) {
    return 'percent'
  }

  const {
    chargeType,
    frequency,
  } = tax

  if (chargeType === CHARGE_TYPE.SINGLE_CHARGE && frequency === FREQUENCIES.PER_NIGHT) {
    return 'per_room_per_night'
  }

  if (chargeType === CHARGE_TYPE.SINGLE_CHARGE && frequency === FREQUENCIES.PER_STAY) {
    return 'per_booking'
  }

  if (chargeType === CHARGE_TYPE.PER_PERSON && frequency === FREQUENCIES.PER_NIGHT) {
    return 'per_person_per_night'
  }

  return 'per_person' // PER PERSON + PER_STAY
}

const getTaxOptionsByChannexPriceMode = (typeInUpperCase) => {
  const type = typeInUpperCase.toLowerCase()

  switch (type) {
    case 'per booking': {
      return { chargeType: CHARGE_TYPE.SINGLE_CHARGE, frequency: FREQUENCIES.PER_STAY }
    }
    case 'per room per night': {
      return { chargeType: CHARGE_TYPE.SINGLE_CHARGE, frequency: FREQUENCIES.PER_NIGHT }
    }
    case 'per person per night': {
      return { chargeType: CHARGE_TYPE.PER_PERSON, frequency: FREQUENCIES.PER_NIGHT }
    }
    case 'per person': {
      return { chargeType: CHARGE_TYPE.PER_PERSON, frequency: FREQUENCIES.PER_STAY }
    }
    default:
      return { chargeType: CHARGE_TYPE.SINGLE_CHARGE, frequency: FREQUENCIES.PER_STAY }
  }
}

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    getLogicType,
    getTaxOptionsByChannexPriceMode,
  },
})
