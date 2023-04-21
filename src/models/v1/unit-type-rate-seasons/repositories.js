const dao = require('../../../services/dao')

const { TABLE_NAME } = require('./constants')

const isCompleted = (data) => {
  if (!data.name) return false
  if (!data.startDate) return false
  if (!data.endDate) return false
  if (!data.accomodations) return false
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

  if (data.accomodations.map((item) => {
    if (item.enabled) {
      if (Number(item.priceNightly) <= 0) return false

      if (data.priceWeekdayEnabled) {
        if (Number(item.priceWeekdayMo) <= 0) return false
        if (Number(item.priceWeekdayTu) <= 0) return false
        if (Number(item.priceWeekdayWe) <= 0) return false
        if (Number(item.priceWeekdayTh) <= 0) return false
        if (Number(item.priceWeekdayFr) <= 0) return false
        if (Number(item.priceWeekdaySa) <= 0) return false
        if (Number(item.priceWeekdaySu) <= 0) return false
      }
    }
    return true
  }).some((results) => results === false)) return false

  return true
}

module.exports = dao({
  tableName: TABLE_NAME,
  methods: {
    isCompleted,
  },
})
