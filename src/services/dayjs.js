const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const isBetween = require('dayjs/plugin/isBetween')

dayjs.extend(utc)
dayjs.extend(isBetween)

module.exports = dayjs
