const roundTo = require('round-to')

const dayjs = require('../../../../../../services/dayjs')
const { STATUSES } = require('../../../../../../models/v1/bookings/constants')
const { handler } = require('../../../../../../services/http')
const { selectBy: selectBookingsBy } = require('../../../../../../models/v1/bookings/repositories')
const { TABLE_NAME: BOOKINGS_TABLE_NAME } = require('../../../../../../models/v1/bookings/constants')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../../../../../../models/v1/units/constants')

module.exports = handler(async ({
  user: { id: userId, accountId },
  params: { id: propertyUnitTypeUnitId }, query: { startDate, endDate },
}, res) => {
  const bookings = await selectBookingsBy({ accountId, propertyUnitTypeUnitId })
    .clearSelect()
    .select([`${BOOKINGS_TABLE_NAME}.*`, `${UNITS_TABLE_NAME}.owner_id`])
    .join(UNITS_TABLE_NAME, `${UNITS_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_unit_type_unit_id`)
    .whereIn(`${BOOKINGS_TABLE_NAME}.status`, [STATUSES.DRAFT, STATUSES.TENTATIVE, STATUSES.CONFIRMED])
    .andWhere((builder) => (
      builder
        .whereBetween('date_arrival', [startDate, endDate])
        .orWhereBetween('date_departure', [startDate, endDate])
    ))

  const data = bookings.map((booking) => {
    const nights = dayjs(booking.dateDeparture)
      .add(1, 'day')
      .diff(dayjs(booking.dateArrival), 'days')

    return {
      id: booking.id,
      startDate: booking.dateArrival,
      endDate: booking.dateDeparture,
      pricePerNight: roundTo(booking.amountTotal / nights, 2),
      createdByOwner: booking.ownerId === userId,
    }
  })

  return res.json({ data })
})
