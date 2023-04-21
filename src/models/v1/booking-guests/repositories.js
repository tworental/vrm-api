const { raw, select } = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: BOOKING_GUESTS_TABLE_NAME } = require('./constants')
const { TABLE_NAME: GUESTS_TABLE_NAME } = require('../guests/constants')

const selectBookingGuests = (bookingId, trx) => (
  select(BOOKING_GUESTS_TABLE_NAME, { bookingId }, trx)
    .clearSelect()
    .select([
      `${BOOKING_GUESTS_TABLE_NAME}.*`,
      `${GUESTS_TABLE_NAME}.title`,
      `${GUESTS_TABLE_NAME}.type`,
      `${GUESTS_TABLE_NAME}.email`,
      `${GUESTS_TABLE_NAME}.phone_number`,
      raw(`TRIM(CONCAT(${GUESTS_TABLE_NAME}.first_name, " ", ${GUESTS_TABLE_NAME}.last_name)) AS fullName`),
    ])
    .join(GUESTS_TABLE_NAME, `${GUESTS_TABLE_NAME}.id`, `${BOOKING_GUESTS_TABLE_NAME}.guest_id`)
)

module.exports = dao({
  tableName: BOOKING_GUESTS_TABLE_NAME,
  methods: {
    selectBookingGuests,
  },
})
