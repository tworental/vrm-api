const dao = require('../../../services/dao')
const { raw, queryBuilder } = require('../../../services/database')

const { TABLE_NAME: GUESTS_TABLE_NAME } = require('./constants')
const { TABLE_NAME: BOOKING_GUESTS_TABLE_NAME } = require('../booking-guests/constants')
const { TABLE_NAME: BOOKINGS_TABLE_NAME } = require('../bookings/constants')
const { TABLE_NAME: BOOKING_SERVICES_TABLE_NAME } = require('../booking-services/constants')
const { TABLE_NAME: BOOKING_FEES_TABLE_NAME } = require('../booking-fees/constants')
const { TABLE_NAME: BOOKING_TAXES_TABLE_NAME } = require('../booking-taxes/constants')

const withBooking = (builder) => builder.leftJoin(BOOKING_GUESTS_TABLE_NAME, `${GUESTS_TABLE_NAME}.id`, `${BOOKING_GUESTS_TABLE_NAME}.guest_id`)
  .join(BOOKINGS_TABLE_NAME, `${BOOKING_GUESTS_TABLE_NAME}.booking_id`, `${BOOKINGS_TABLE_NAME}.id`)
  .leftJoin(
    queryBuilder(BOOKING_SERVICES_TABLE_NAME)
      .select(['booking_id', raw('SUM(total_amount_exchanged) as total_amount_exchanged')])
      .groupBy('booking_id')
      .as(BOOKING_SERVICES_TABLE_NAME),
    `${BOOKINGS_TABLE_NAME}.id`,
    `${BOOKING_SERVICES_TABLE_NAME}.booking_id`,
  )
  .leftJoin(
    queryBuilder(BOOKING_FEES_TABLE_NAME)
      .select(['booking_id', raw('SUM(total_amount_exchanged) as total_amount_exchanged')])
      .groupBy('booking_id')
      .as(BOOKING_FEES_TABLE_NAME),
    `${BOOKINGS_TABLE_NAME}.id`,
    `${BOOKING_FEES_TABLE_NAME}.booking_id`,
  )
  .leftJoin(
    queryBuilder(BOOKING_TAXES_TABLE_NAME)
      .select(['booking_id', raw('SUM(total_amount_exchanged) as total_amount_exchanged')])
      .groupBy('booking_id')
      .as(BOOKING_TAXES_TABLE_NAME),
    `${BOOKINGS_TABLE_NAME}.id`,
    `${BOOKING_TAXES_TABLE_NAME}.booking_id`,
  )
  .clearSelect()
  .select([
    `${GUESTS_TABLE_NAME}.*`,
    `${BOOKINGS_TABLE_NAME}.currency`,
    raw(`SUM(${BOOKINGS_TABLE_NAME}.amount_total + IFNULL(${BOOKING_SERVICES_TABLE_NAME}.total_amount_exchanged, 0) + IFNULL(${BOOKING_FEES_TABLE_NAME}.total_amount_exchanged, 0) + IFNULL(${BOOKING_TAXES_TABLE_NAME}.total_amount_exchanged, 0)) as amount_total`),
    raw(`SUM(DATEDIFF(${BOOKINGS_TABLE_NAME}.date_departure, ${BOOKINGS_TABLE_NAME}.date_arrival)) AS total_nights`),
    raw(`SUM(${BOOKINGS_TABLE_NAME}.guests_infants + ${BOOKINGS_TABLE_NAME}.guests_infants + ${BOOKINGS_TABLE_NAME}.guests_teens + ${BOOKINGS_TABLE_NAME}.guests_adults) AS total_guests`),
  ])
  .groupBy('guests.id')

module.exports = dao({
  tableName: GUESTS_TABLE_NAME,
  jsonFields: ['parlance', 'labels'],
  methods: {
    withBooking,
  },
})
