const roundTo = require('round-to')
const {
  raw,
  select,
  selectOne,
  update,
  createTransaction,
} = require('../../../services/database')
const cache = require('../../../services/cacheManager')
const dao = require('../../../services/dao')
const dayjs = require('../../../services/dayjs')
const { publish } = require('../../../services/pubsub')
const { getByISO } = require('../../../services/country-code-lookup')
const { i18n } = require('../../../services/i18n')

const {
  generateInvoice: generateDocumentInvoice,
  generateInvoiceNo: generateDocumentInvoiceNo,
  calculateInvoice,
} = require('../documents/invoices/repositories')
const { selectOneBy: selectInvoiceSettings } = require('../documents/invoices/settings/repositories')
const { create: createBookingInvoice } = require('../booking-invoices/repositories')
const { selectOneBy: selectAccountBy } = require('../accounts/repositories')
const { selectOneBy: selectAccountSettingsBy } = require('../account-settings/repositories')
const { selectOneBy: selectBookingGuest } = require('../booking-guests/repositories')
const { selectBy: selectBookingServices } = require('../booking-services/repositories')
const { selectBy: selectBookingTaxes } = require('../booking-taxes/repositories')
const { selectBy: selectBookingFees } = require('../booking-fees/repositories')
const { selectLimits, getLimitByKey } = require('../limits/repositories')

const { TABLE_NAME: BOOKINGS_TABLE_NAME, STATUSES, LISTENERS } = require('./constants')
const { TABLE_NAME: PROPERTIES_TABLE_NAME } = require('../properties/constants')
const { TABLE_NAME: UNIT_TYPES_TABLE_NAME } = require('../unit-types/constants')
const { TABLE_NAME: UNITS_TABLE_NAME } = require('../units/constants')
const { TABLE_NAME: BOOKING_GUESTS_TABLE_NAME } = require('../booking-guests/constants')
const { TABLE_NAME: BOOKING_INVOICES_TABLE_NAME } = require('../booking-invoices/constants')
const { TABLE_NAME: GUESTS_TABLE_NAME } = require('../guests/constants')
const { DEFAULT_LANGUAGE } = require('../languages/constants')
const { LIMITS } = require('../limits/constants')

// NOTE: amountTotalTax should be always be as amount (not as percentage)!
const calculateTotalAmount = ({
  amountAccommodationDue = 0,
  amountDiscount = 0,
  amountTotalTax = 0,
  totalExtras = 0,
}) => (amountAccommodationDue - amountDiscount) + amountTotalTax + totalExtras

const calculateOccupancy = (booking) => (
  (booking.guestsChildren || 0)
  + (booking.guestsAdults || 0)
  + (booking.guestsTeens || 0)
  + (booking.guestsInfants || 0)
)

const filterBookings = ({
  accountId,
  priceMin,
  priceMax,
  startDate,
  endDate,
  propertyIds = [],
  propertyUnitTypeIds = [],
  statuses = [],
}, currentPage = 1, perPage = 25) => {
  let queryBuilder = select(BOOKINGS_TABLE_NAME)
    .select([
      raw(`${PROPERTIES_TABLE_NAME}.name AS propertyName`),
      raw(`${UNIT_TYPES_TABLE_NAME}.name AS propertyUnitTypeName`),
      raw(`${UNITS_TABLE_NAME}.name AS propertyUnitTypeUnitName`),
      raw(`CONCAT(${GUESTS_TABLE_NAME}.first_name, " ", ${GUESTS_TABLE_NAME}.last_name) AS guestName`),
      raw(`DATEDIFF(${BOOKINGS_TABLE_NAME}.date_departure, ${BOOKINGS_TABLE_NAME}.date_arrival) AS totalNights`),
      raw(`${PROPERTIES_TABLE_NAME}.multiple_unit_types`),
      raw(`(
        ${BOOKINGS_TABLE_NAME}.guests_adults +
        ${BOOKINGS_TABLE_NAME}.guests_children +
        ${BOOKINGS_TABLE_NAME}.guests_teens +
        ${BOOKINGS_TABLE_NAME}.guests_infants
      ) AS totalGuests`),
      raw(`${UNITS_TABLE_NAME}.deleted_at AS propertyUnitTypeUnitDeletedAt`),
    ])
    .join(PROPERTIES_TABLE_NAME, `${PROPERTIES_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_id`)
    .join(UNIT_TYPES_TABLE_NAME, `${UNIT_TYPES_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_unit_type_id`)
    .join(UNITS_TABLE_NAME, `${UNITS_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_unit_type_unit_id`)
    .leftJoin(BOOKING_GUESTS_TABLE_NAME, `${BOOKINGS_TABLE_NAME}.id`, `${BOOKING_GUESTS_TABLE_NAME}.booking_id`)
    .leftJoin(GUESTS_TABLE_NAME, `${GUESTS_TABLE_NAME}.id`, `${BOOKING_GUESTS_TABLE_NAME}.guest_id`)
    .where(`${BOOKINGS_TABLE_NAME}.account_id`, '=', accountId)
    .whereNull(`${BOOKINGS_TABLE_NAME}.archived_at`)
    .whereBetween(`${BOOKINGS_TABLE_NAME}.amount_total`, [priceMin, priceMax])
    .andWhere((builder) => (
      builder
        .whereBetween(`${BOOKINGS_TABLE_NAME}.date_arrival`, [startDate, endDate])
        .orWhereBetween(`${BOOKINGS_TABLE_NAME}.date_departure`, [startDate, endDate])
    ))

  if (propertyIds.length) {
    queryBuilder = queryBuilder
      .whereIn(`${BOOKINGS_TABLE_NAME}.property_id`, propertyIds)
  }

  if (propertyUnitTypeIds.length) {
    queryBuilder = queryBuilder
      .whereIn(`${BOOKINGS_TABLE_NAME}.property_unit_type_id`, propertyUnitTypeIds)
  }

  if (propertyUnitTypeIds.length) {
    queryBuilder = queryBuilder
      .whereIn(`${BOOKINGS_TABLE_NAME}.property_unit_type_id`, propertyUnitTypeIds)
  }

  if (statuses.length) {
    queryBuilder = queryBuilder
      .whereIn(`${BOOKINGS_TABLE_NAME}.status`, statuses)
  }

  return queryBuilder
    .orderBy(`${BOOKINGS_TABLE_NAME}.date_arrival`, 'desc')
    .orderBy(`${BOOKINGS_TABLE_NAME}.created_at`, 'desc')
    .orderBy(`${BOOKINGS_TABLE_NAME}.id`, 'desc')
    .paginate({ perPage, currentPage })
}

const bookingDetails = ({ id, accountId }, trx) => (
  selectOne(BOOKINGS_TABLE_NAME, {}, trx)
    .select([
      raw(`${PROPERTIES_TABLE_NAME}.name AS propertyName`),
      raw(`${UNIT_TYPES_TABLE_NAME}.name AS propertyUnitTypeName`),
      raw(`${UNITS_TABLE_NAME}.name AS propertyUnitTypeUnitName`),
    ])
    .join(PROPERTIES_TABLE_NAME, `${PROPERTIES_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_id`)
    .join(UNIT_TYPES_TABLE_NAME, `${UNIT_TYPES_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_unit_type_id`)
    .join(UNITS_TABLE_NAME, `${UNITS_TABLE_NAME}.id`, `${BOOKINGS_TABLE_NAME}.property_unit_type_unit_id`)
    .where(`${BOOKINGS_TABLE_NAME}.id`, '=', id)
    .where(`${BOOKINGS_TABLE_NAME}.account_id`, '=', accountId)
)

const changeBookingStatus = async (booking, trx) => {
  const {
    id,
    status: currentStatus,
    dateArrival,
    dateDeparture,
    amountTotalPaid,
    amountTotal,
    currency,
    archivedAt,
  } = booking

  if (dateArrival && dateDeparture && amountTotal && currency && !archivedAt) {
    const bookingGuest = await selectOne(BOOKING_GUESTS_TABLE_NAME, { bookingId: booking.id }, trx)

    if (bookingGuest) {
      let status = currentStatus
      const extra = {}

      if ([STATUSES.DRAFT, STATUSES.TENTATIVE].includes(currentStatus)) {
        status = STATUSES.TENTATIVE

        if (amountTotalPaid >= amountTotal) {
          status = STATUSES.CONFIRMED
          extra.dateConfirmed = new Date(Date.now())
        }
      }

      const response = await update(BOOKINGS_TABLE_NAME, { status, ...extra }, { id }, trx)

      publish(LISTENERS.STATUS_CHANGED, {
        ...booking,
        id,
        prevStatus: currentStatus,
        status,
      })

      return response
    }
  }
  return null
}

const generateInvoice = async (booking) => createTransaction(async (trx) => {
  const bookingId = booking.id
  const bookingInvoice = await selectOne(BOOKING_INVOICES_TABLE_NAME, { bookingId }, trx)

  const guest = await selectBookingGuest({ bookingId })
    .select([
      raw(`TRIM(CONCAT(${GUESTS_TABLE_NAME}.first_name, " ", ${GUESTS_TABLE_NAME}.last_name)) AS fullName`),
      `${GUESTS_TABLE_NAME}.address as address`,
      `${GUESTS_TABLE_NAME}.city as city`,
      `${GUESTS_TABLE_NAME}.zip as zip`,
      `${GUESTS_TABLE_NAME}.country_code as country`,
    ])
    .join(GUESTS_TABLE_NAME, `${GUESTS_TABLE_NAME}.id`, `${BOOKING_GUESTS_TABLE_NAME}.guest_id`)

  const services = await selectBookingServices({ bookingId })
  const taxes = await selectBookingTaxes({ bookingId })
  const fees = await selectBookingFees({ bookingId })

  const { accountId } = booking

  const account = await selectAccountBy({ id: accountId }, trx)
  const { locale } = await selectAccountSettingsBy({ accountId }, trx)

  const invoiceSettings = await selectInvoiceSettings({ accountId }, trx)

  const settingsSeller = (invoiceSettings && invoiceSettings.seller) || {}
  const settingsLanguage = (invoiceSettings && invoiceSettings.language) || DEFAULT_LANGUAGE

  const sellerInfo = {
    sellerName: settingsSeller.sellerName || account.companyName,
    sellerAddress: settingsSeller.sellerAddress || account.companyAddress,
    sellerCity: settingsSeller.sellerCity || account.companyCity,
    sellerCountry: getByISO(settingsSeller.sellerCountry || account.companyCountry || ''),
    sellerZip: settingsSeller.sellerZip || account.companyZip,
    sellerTaxId: settingsSeller.sellerTaxId || account.companyVatId,
  }
  const buyerInfo = {
    buyerName: guest.fullName,
    buyerAddress: guest.address,
    buyerCity: guest.city,
    buyerCountry: getByISO(guest.country || ''),
    buyerZip: guest.zip,
    buyerTaxId: null,
  }
  const invoiceItems = [
    {
      name: 'Accommodation',
      quantity: 1,
      price: booking.amountAccommodationDue,
      tax: roundTo((booking.amountTotalTax / booking.amountAccommodationDue) * 100, 2),
      discount: booking.amountDiscount,
    },
    ...services.map((service) => ({
      name: service.name,
      quantity: service.quantity || 1,
      price: roundTo(service.totalAmountExchanged / service.quantity, 2),
      tax: !service.taxIncluded ? service.taxValue : 0,
      discount: 0,
    })),
    ...taxes.map((tax) => ({
      name: tax.name,
      quantity: 1,
      price: tax.totalAmountExchanged,
      tax: 0,
      discount: 0,
    })),
    ...fees.map((fee) => ({
      name: fee.name,
      quantity: 1,
      price: fee.totalAmountExchanged,
      tax: 0,
      discount: 0,
    })),
  ]

  const payload = {
    invoiceNo: !bookingInvoice ? await generateDocumentInvoiceNo(accountId) : bookingInvoice.invoiceNo,
    taxNotation: 'vat',
    paymentType: 'cash', // TODO: ask about
    status: 'issued', // TODO: ask about
    invoiceType: 'invoice',
    invoiceDate: dayjs().format('YYYY-MM-DD'),
    invoiceDueDate: dayjs().add(3, 'days').format('YYYY-MM-DD'), // TODO: ask about due
    invoiceItems,
    ...sellerInfo,
    ...buyerInfo,
    currency: booking.currency,
  }

  const limits = await selectLimits({ accountId, packageId: account.packageId })

  const t = i18n(settingsLanguage, {
    locales: getLimitByKey(LIMITS.APP_DOCUMENTS_INVOICES_LANGUAGES_LIST, limits, [DEFAULT_LANGUAGE]),
  })

  const data = {
    ...calculateInvoice(payload),
    invoiceTitle: t('invoices.bookingInvoiceTitle'),
    accountId,
    id: bookingInvoice ? bookingInvoice.documentsInvoiceId : null,
    isPaid: booking.amountTotalPaid >= booking.amountTotal,
    s3InvoicePath: bookingInvoice ? bookingInvoice.s3InvoicePath : null,
  }

  const documentsInvoiceId = await generateDocumentInvoice(data, { locale, t }, trx)

  if (!bookingInvoice) {
    await createBookingInvoice({ bookingId, documentsInvoiceId }, trx)
  }

  cache.del([`accounts.${accountId}.invoices.*`])
})

module.exports = dao({
  tableName: BOOKINGS_TABLE_NAME,
  methods: {
    calculateTotalAmount,
    calculateOccupancy,
    filterBookings,
    bookingDetails,
    changeBookingStatus,
    generateInvoice,
  },
})
