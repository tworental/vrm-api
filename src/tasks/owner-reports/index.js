const bluebird = require('bluebird')

const dayjs = require('../../services/dayjs')
const { raw } = require('../../services/database')
const { i18n } = require('../../services/i18n')
const { sumArray } = require('../../services/number')
const { TABLE_NAME: ACCOUNT_SETTINGS_TABLE_NAME } = require('../../models/v1/account-settings/constants')
const { TABLE_NAME: BOOKINGS_TABLE_NAME, STATUSES } = require('../../models/v1/bookings/constants')
const { TABLE_NAME: PROPERTIES_TABLE_NAME } = require('../../models/v1/properties/constants')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../../models/v1/units/constants')
const { TABLE_NAME: OWNERS_TABLE_NAME } = require('../../models/v1/owners/constants')
const { selectBy: selectBookingsBy } = require('../../models/v1/bookings/repositories')
const { amountByCurrency } = require('../../models/v1/dict-currency-rates/repositories')
const { create: createReport, generateReport } = require('../../models/v1/owner-reports/repositories')
const { create: createReportItem } = require('../../models/v1/owner-report-items/repositories')

module.exports = async () => {
  const month = dayjs().subtract(1, 'month').get('month') + 1
  const year = dayjs().subtract(1, 'month').get('year')

  const bookings = await selectBookingsBy()
    .clearSelect()
    .select([
      `${BOOKINGS_TABLE_NAME}.*`,
      `${UNITS_TABLE_NAME}.owner_id`,
      `${PROPERTIES_TABLE_NAME}.name as propertyName`,
      `${UNITS_TABLE_NAME}.name as unitName`,
      raw(`DATEDIFF(${BOOKINGS_TABLE_NAME}.date_departure, ${BOOKINGS_TABLE_NAME}.date_arrival) AS totalNights`),
      raw(`IFNULL(${OWNERS_TABLE_NAME}.agency_commission, 0) as commission`),
      `${ACCOUNT_SETTINGS_TABLE_NAME}.currency as defaultCurrency`,
      `${ACCOUNT_SETTINGS_TABLE_NAME}.locale as locale`,
      `${ACCOUNT_SETTINGS_TABLE_NAME}.language as language`,
    ])
    .join(ACCOUNT_SETTINGS_TABLE_NAME, `${ACCOUNT_SETTINGS_TABLE_NAME}.account_id`, `${BOOKINGS_TABLE_NAME}.account_id`)
    .join(PROPERTIES_TABLE_NAME, `${PROPERTIES_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_id`)
    .join(UNITS_TABLE_NAME, `${UNITS_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_unit_type_unit_id`)
    .join(OWNERS_TABLE_NAME, `${OWNERS_TABLE_NAME}.id`, `${UNITS_TABLE_NAME}.owner_id`)
    .whereNotNull(`${UNITS_TABLE_NAME}.ownerId`)
    .where(`${BOOKINGS_TABLE_NAME}.status`, STATUSES.CONFIRMED)
    .whereRaw('MONTH(date_departure) = ? and YEAR(date_departure) = ?', [month, year])

  const groupedBookings = Object.values(
    bookings.reduce((acc, curr) => ({
      ...acc,
      [curr.ownerId]: [...acc[[curr.ownerId]] || [], curr],
    }), {}),
  )

  await bluebird.map(groupedBookings, async (reportBookings) => {
    const {
      defaultCurrency, ownerId, accountId, locale, language,
    } = reportBookings[0]
    const date = dayjs().set('month', month - 1).endOf('month').toISOString()
    const currencyRate = await amountByCurrency(defaultCurrency)

    const income = sumArray(reportBookings.map((booking) => currencyRate(booking.amountTotalPaid, booking.currency)))

    const reportItems = reportBookings.map((booking) => {
      const { commission } = booking

      const totalAmount = booking.amountTotal
      const totalAmountExchanged = currencyRate(totalAmount, booking.currency)

      const chargedAmount = booking.amountTotalPaid
      const chargedAmountExchanged = currencyRate(chargedAmount, booking.currency)

      const priceNightly = totalAmount / booking.totalNights
      const priceNightlyExchanged = currencyRate(priceNightly, booking.currency)

      const due = totalAmount * (1 - (commission / 100))
      const dueExchanged = currencyRate(due, booking.currency)

      const rate = totalAmountExchanged / totalAmount

      return {
        ownerId,
        accountId,
        name: `${booking.unitName} / ${booking.propertyName}`,
        dateArrival: booking.dateArrival,
        dateDeparture: booking.dateDeparture,
        totalNights: booking.totalNights,
        currency: booking.currency,
        currencyRate: rate,
        priceNightly,
        priceNightlyExchanged,
        totalAmount,
        totalAmountExchanged,
        chargedAmount,
        chargedAmountExchanged,
        commission,
        due,
        dueExchanged,
      }
    })

    const reportData = {
      name: 'Report',
      accountId,
      ownerId,
      currency: defaultCurrency,
      date,
      income,
      notes: null,
    }

    const t = i18n(language, { locales: ['en'] })

    const s3ReportPath = await generateReport({ ...reportData, locale }, reportItems, t)

    const ownerReportId = await createReport({ ...reportData, s3ReportPath })

    await bluebird.map(reportItems, (item) => createReportItem({ ...item, ownerReportId }))
  })
}
