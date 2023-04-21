const { onlyKeys } = require('../../../services/utility')
const dao = require('../../../services/dao')

const { TABLE_NAME } = require('./constants')

const rateAttrs = (data) => onlyKeys(data, [
  'priceWeekdayEnabled',
  'discountEnabled',
  'discountType',
  'discountWeekly',
  'discountMonthly',
  'discountCustomEnabled',
  'discountCustom',
  'discountCustomPeriod',
  'minStayDays',
  'minStayWeekdayEnabled',
  'minStayWeekdayMo',
  'minStayWeekdayTu',
  'minStayWeekdayWe',
  'minStayWeekdayTh',
  'minStayWeekdayFr',
  'minStayWeekdaySa',
  'minStayWeekdaySu',
  'occupancyEnabled',
  'occupancyStartsAfterPerson',
  'occupancyExtraCharge',
  'shortStayEnabled',
  'shortStayDays',
  'shortStayExtraCharge',
  'selfServiceRestrictionsEnabled',
  'selfServiceCheckinMo',
  'selfServiceCheckinTu',
  'selfServiceCheckinWe',
  'selfServiceCheckinTh',
  'selfServiceCheckinFr',
  'selfServiceCheckinSa',
  'selfServiceCheckinSu',
  'selfServiceCheckoutMo',
  'selfServiceCheckoutTu',
  'selfServiceCheckoutWe',
  'selfServiceCheckoutTh',
  'selfServiceCheckoutFr',
  'selfServiceCheckoutSa',
  'selfServiceCheckoutSu',
  'notesEnabled',
  'notes',
])

const ratePriceAttrs = (data) => onlyKeys(data, [
  'priceNightly',
  'priceWeekdayMo',
  'priceWeekdayTu',
  'priceWeekdayWe',
  'priceWeekdayTh',
  'priceWeekdayFr',
  'priceWeekdaySa',
  'priceWeekdaySu',
])

const isCompleted = (data) => {
  if (!data.name) return false
  if (!data.currency) return false

  if (Number(data.priceNightly) <= 0) return false

  if (data.priceWeekdayEnabled) {
    if (Number(data.priceWeekdayMo) <= 0) return false
    if (Number(data.priceWeekdayTu) <= 0) return false
    if (Number(data.priceWeekdayWe) <= 0) return false
    if (Number(data.priceWeekdayTh) <= 0) return false
    if (Number(data.priceWeekdayFr) <= 0) return false
    if (Number(data.priceWeekdaySa) <= 0) return false
    if (Number(data.priceWeekdaySu) <= 0) return false
  }

  if (Number(data.minStayDays) < 1) return false

  if (data.minStayWeekdayEnabled) {
    if (Number(data.minStayWeekdayMo) <= 0) return false
    if (Number(data.minStayWeekdayTu) <= 0) return false
    if (Number(data.minStayWeekdayWe) <= 0) return false
    if (Number(data.minStayWeekdayTh) <= 0) return false
    if (Number(data.minStayWeekdayFr) <= 0) return false
    if (Number(data.minStayWeekdaySa) <= 0) return false
    if (Number(data.minStayWeekdaySu) <= 0) return false
  }

  return true
}

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    rateAttrs,
    ratePriceAttrs,
    isCompleted,
  },
})
