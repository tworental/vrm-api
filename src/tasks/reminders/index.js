const config = require('config')
const bluebird = require('bluebird')

const dayjs = require('../../services/dayjs')
const { publish } = require('../../services/sqs')
const { TABLE_NAME: BOOKINGS_TABLE_NAME } = require('../../models/v1/bookings/constants')
const { TABLE_NAME: BOOKING_SERVICES_TABLE_NAME } = require('../../models/v1/booking-services/constants')
const { TABLE_NAME: PROPERTY_SERVICES_TABLE_NAME } = require('../../models/v1/property-services/constants')
const { TABLE_NAME: SERVICE_REMINDERS_TABLE_NAME, EVENT_TYPES } = require('../../models/v1/service-reminders/constants')
const { selectBy } = require('../../models/v1/booking-services/repositories')

/*
* timeRange - time span (in minutes) which must be checked
* @example
* handleEventPredicate({ timeRange: 5 }) will return predicate-function,
* which will be checking all dates in 5-minute range from specific date
* */
const handleEventPredicate = ({ timeRange }) => (event) => {
  switch (event.reminderEventType) {
    case EVENT_TYPES.BEFORE_SERVICE: {
      const start = dayjs.utc(`${event.startDate} ${event.startTime || '00:00:00'}`, 'YYYY-MM-DD hh:mm:ss')

      const now = dayjs.utc()
        .add(event.reminderTime, event.reminderTimeUnit)
        .set('seconds', 0)
        .set('milliseconds', 0)

      const nowAfterRange = now
        .add(timeRange, 'minutes')
        .subtract(1, 'seconds')

      return start.isBetween(now, nowAfterRange) || start.isSame(now)
    }
    case EVENT_TYPES.AFTER_SERVICE: {
      const start = dayjs.utc(`${event.startDate} ${event.startTime || '00:00:00'}`, 'YYYY-MM-DD hh:mm:ss')
      const now = dayjs.utc()
        .subtract(event.reminderTime, event.reminderTimeUnit)
        .set('seconds', 0)
        .set('milliseconds', 0)

      const nowAfterRange = now
        .add(timeRange, 'minutes')
        .subtract(1, 'seconds')

      return start.isBetween(now, nowAfterRange) || start.isSame(now)
    }
    case EVENT_TYPES.BEFORE_CHECK_IN: {
      const start = dayjs.utc(event.bookingDateArrival)
      const now = dayjs.utc()
        .add(event.reminderTime, event.reminderTimeUnit)
        .set('seconds', 0)
        .set('milliseconds', 0)

      const nowAfterRange = now
        .add(timeRange, 'minutes')
        .subtract(1, 'seconds')

      return start.isBetween(now, nowAfterRange) || start.isSame(now)
    }
    case EVENT_TYPES.AFTER_CHECK_IN: {
      if (!event.bookingGuestDateCheckin) return false

      const start = dayjs.utc(event.bookingGuestDateCheckin)
      const now = dayjs.utc()
        .subtract(event.reminderTime, event.reminderTimeUnit)
        .set('seconds', 0)
        .set('milliseconds', 0)

      const nowAfterRange = now
        .add(timeRange, 'minutes')
        .subtract(1, 'seconds')

      return start.isBetween(now, nowAfterRange) || start.isSame(now)
    }
    case EVENT_TYPES.BEFORE_CHECK_OUT: {
      const start = dayjs.utc(event.bookingDateDeparture)
      const now = dayjs.utc()
        .add(event.reminderTime, event.reminderTimeUnit)
        .set('seconds', 0)
        .set('milliseconds', 0)

      const nowAfterRange = now
        .add(timeRange, 'minutes')
        .subtract(1, 'seconds')

      return start.isBetween(now, nowAfterRange) || start.isSame(now)
    }
    case EVENT_TYPES.AFTER_CHECK_OUT: {
      if (!event.bookingGuestDateCheckout) return false

      const start = dayjs.utc(event.bookingGuestDateCheckout)
      const now = dayjs.utc()
        .subtract(event.reminderTime, event.reminderTimeUnit)
        .set('seconds', 0)
        .set('milliseconds', 0)

      const nowAfterRange = now
        .add(timeRange, 'minutes')
        .subtract(1, 'seconds')

      return start.isBetween(now, nowAfterRange) || start.isSame(now)
    }
    default:
      return false
  }
}

module.exports = async ({ timeRange } = { timeRange: 0 }) => {
  const response = await selectBy()
    .select([
      `${SERVICE_REMINDERS_TABLE_NAME}.id as reminderId`,
      `${SERVICE_REMINDERS_TABLE_NAME}.time as reminderTime`,
      `${SERVICE_REMINDERS_TABLE_NAME}.time_unit as reminderTimeUnit`,
      `${SERVICE_REMINDERS_TABLE_NAME}.event_type as reminderEventType`,
      `${SERVICE_REMINDERS_TABLE_NAME}.reminder_sms as reminderSmsEnabled`,
      `${SERVICE_REMINDERS_TABLE_NAME}.reminder_email as reminderEmailEnabled`,
      `${SERVICE_REMINDERS_TABLE_NAME}.phone_number as reminderPhoneNumber`,
      `${SERVICE_REMINDERS_TABLE_NAME}.email as reminderEmail`,
      `${BOOKINGS_TABLE_NAME}.date_arrival as bookingDateArrival`,
      `${BOOKINGS_TABLE_NAME}.date_departure as bookingDateDeparture`,
      `${BOOKINGS_TABLE_NAME}.checkin_at as bookingGuestDateCheckin`,
      `${BOOKINGS_TABLE_NAME}.checkout_at as bookingGuestDateCheckout`,
    ])
    .join(PROPERTY_SERVICES_TABLE_NAME, `${PROPERTY_SERVICES_TABLE_NAME}.id`, `${BOOKING_SERVICES_TABLE_NAME}.property_service_id`)
    .join(SERVICE_REMINDERS_TABLE_NAME, `${SERVICE_REMINDERS_TABLE_NAME}.service_id`, `${PROPERTY_SERVICES_TABLE_NAME}.service_id`)
    .join(BOOKINGS_TABLE_NAME, `${BOOKINGS_TABLE_NAME}.id`, `${BOOKING_SERVICES_TABLE_NAME}.booking_id`)
    .where((queryBuilder) => {
      queryBuilder.where('reminder_sms', '=', 1)
        .orWhere('reminder_email', '=', 1)
    })

  await bluebird.map(response.filter(handleEventPredicate({ timeRange })), async (event) => {
    // add to queues
    if (event.reminderEmailEnabled) {
      // add to email queue
      await (await publish(config.get('aws.sqs.reminderEmailsQueue')))(event)
    }

    if (event.reminderSmsEnabled) {
      // add to sms queue
      await (await publish(config.get('aws.sqs.reminderSmsQueue')))(event)
    }
  })
}
