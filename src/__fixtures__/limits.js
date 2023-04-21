const { LIMITS } = require('../models/v1/limits/constants')
const { DEFAULT_LANGUAGE } = require('../models/v1/languages/constants')

const APP_LIMITS = [
  {
    name: LIMITS.APP_SETTINGS_ENABLED,
    value: 1,
    description: 'Are Global Settings module enabled or disabled',
  },
  {
    name: LIMITS.APP_BILLINGS_ENABLED,
    value: 1,
    description: 'Are Billings module enabled or disabled',
  },
  {
    name: LIMITS.APP_STORAGE_ENABLED,
    value: 1,
    description: 'Are Storage module enabled or disabled',
  },
  {
    name: LIMITS.APP_STORAGE_QUOTA,
    value: 524288000, // 500 MB
    description: 'The Storage quota',
  },
  {
    name: LIMITS.APP_STORAGE_FILES_MAX_FILE,
    value: 15728640, // 15 MB
    description: 'Max file uploading size',
  },
  {
    name: LIMITS.APP_TEAM_ENABLED,
    value: 1,
    description: 'Does Team module enabled or disabled',
  },
  {
    name: LIMITS.APP_TEAM_SIZE_LIMIT,
    value: 2,
    description: 'The Team size limit',
  },
  {
    name: LIMITS.APP_OWNERS_ENABLED,
    value: 0,
    description: 'Are Owners module enabled or disabled',
  },
  {
    name: LIMITS.APP_RATE_SEASONS_ENABLED,
    value: 1,
    description: 'Are templates Seasons Rates module enabled or disabled',
  },
  {
    name: LIMITS.APP_RATE_SEASONS_SIZE_LIMIT,
    value: 1,
    description: 'The templates Seasons Rates size limit',
  },
  {
    name: LIMITS.APP_BOOKINGS_ENABLED,
    value: 1,
    description: 'Are Bookings module enabled or disabled',
  },
  {
    name: LIMITS.APP_DOCUMENTS_ENABLED,
    value: 0,
    description: 'Are Documents module enabled or disabled',
  },
  {
    name: LIMITS.APP_DOCUMENTS_INVOICES_ENABLED,
    value: 0,
    description: 'Are Documents Invoices module is enabled or disabled',
  },
  {
    name: LIMITS.APP_DOCUMENTS_INVOICES_LANGUAGES_LIST,
    value: JSON.stringify(['en', 'pl', 'lt']),
    description: 'List of available languages for PDF invoices',
  },
  {
    name: LIMITS.APP_ONBOARDING_ENABLED,
    value: 1,
    description: 'Does Onboarding process for the User is enabled or disabled',
  },
  {
    name: LIMITS.APP_CHANNELS_CHANNEX_ENABLED,
    value: 1,
    description: 'Does Channel Manager: Channex.io is enabled or disabled',
  },
  {
    name: LIMITS.APP_STATISTICS_ENABLED,
    value: 1,
    description: 'Are Statistics module is enabled or disabled',
  },
  {
    name: LIMITS.APP_WEBSITE_BUILDER_ENABLED,
    value: 0,
    description: 'Does Website Builder module is enabled or disabled',
  },
  {
    name: LIMITS.APP_INTEGRATIONS_ENABLED,
    value: 1,
    description: 'Are Integrations / Marketplace module is enabled or disabled',
  },
  {
    name: LIMITS.APP_BOOKINGS_CALENDAR_ENABLED,
    value: 1,
    description: 'Are Bookings Calendar module is enabled or disabled',
  },
  {
    name: LIMITS.APP_GUESTS_ENABLED,
    value: 1,
    description: 'Are Guests module is enabled or disabled',
  },
  {
    name: LIMITS.APP_COMPANIES_ENABLED,
    value: 1,
    description: 'Are Companies module is enabled or disabled',
  },
  {
    name: LIMITS.APP_SERVICES_ENABLED,
    value: 1,
    description: 'Are Services module enabled or disabled',
  },
  {
    name: LIMITS.APP_SERVICES_SIZE_LIMIT,
    value: 5,
    description: 'The Services count limit',
  },
  {
    name: LIMITS.APP_SERVICES_REMINDERS_ENABLED,
    value: 1,
    description: 'Are Services Reminders & Notifications module enabled or disabled',
  },
  {
    name: LIMITS.APP_SERVICES_REMINDERS_SIZE_LIMIT,
    value: 5,
    description: 'The Services Reminders & Notifications count limit per service',
  },
  {
    name: LIMITS.APP_FEES_ENABLED,
    value: 1,
    description: 'Are Rental Fees module enabled or disabled',
  },
  {
    name: LIMITS.APP_FEES_SIZE_LIMIT,
    value: 5,
    description: 'The Rental Fees count limit',
  },
  {
    name: LIMITS.APP_TAXES_ENABLED,
    value: 1,
    description: 'Are Rental Taxes module enabled or disabled',
  },
  {
    name: LIMITS.APP_TAXES_SIZE_LIMIT,
    value: 5,
    description: 'The Rental Taxes count limit',
  },
  {
    name: LIMITS.APP_PHONE_VERIFICATION_ENABLED,
    value: 1,
    description: 'Are user phone number should be verified',
  },
  {
    name: LIMITS.APP_SALES_CHANNELS_ENABLED,
    value: 1,
    description: 'Are Sales Channels settings enabled or disabled',
  },
  {
    name: LIMITS.APP_CHANNELS_ENABLED,
    value: 1,
    description: 'Are Channels module enabled or disabled',
  },
  {
    name: LIMITS.APP_LANGUAGES_LIST,
    value: JSON.stringify([DEFAULT_LANGUAGE]),
    description: 'List of available languages for main app',
  },
  {
    name: LIMITS.APP_LANGUAGES_DEFAULT,
    value: DEFAULT_LANGUAGE,
    description: 'Default language for account',
  },
  {
    name: LIMITS.APP_PROPERTIES_ENABLED,
    value: 1,
    description: 'Are Properties module is enabled or disabled',
  },
  {
    name: LIMITS.APP_PROPERTIES_HOTEL_MODE_ENABLED,
    value: 0,
    description: 'Is the Hotel Mode enabled or disabled for properties',
  },
  {
    name: LIMITS.APP_PROPERTIES_SIZE_LIMIT,
    value: 5,
    description: 'The Properties count limit per account',
  },
  {
    name: LIMITS.APP_PROPERTIES_UNIT_TYPES_ENABLED,
    value: 1,
    description: 'Are Unit Yypes enabled or disabled',
  },
  {
    name: LIMITS.APP_PROPERTIES_UNIT_TYPES_SIZE_LIMIT,
    value: 1,
    description: 'The Unit Types count limit per property',
  },
  {
    name: LIMITS.APP_PROPERTIES_UNITS_ENABLED,
    value: 1,
    description: 'Are Property Units enabled or disabled',
  },
  {
    name: LIMITS.APP_PROPERTIES_UNITS_SIZE_LIMIT,
    value: 1,
    description: 'The Unit count limit per property unit type',
  },
  {
    name: LIMITS.APP_PROPERTIES_UNIT_TYPES_SEASONS_SIZE_LIMIT,
    value: 1,
    description: 'The Seasons Rates size limit per unit type',
  },
]

const OWNERS_LIMITS = [
  {
    name: LIMITS.OWNERS_PHONE_VERIFICATION_ENABLED,
    value: 1,
    description: 'Does user phone number should be verified for owners',
  },
  {
    name: LIMITS.OWNERS_LANGUAGES_DEFAULT,
    value: DEFAULT_LANGUAGE,
    description: 'Default language for owner panel',
  },
  {
    name: LIMITS.OWNERS_LANGUAGES_LIST,
    value: JSON.stringify([DEFAULT_LANGUAGE]),
    description: 'List of available languages for owners panel',
  },
  {
    name: LIMITS.OWNERS_ONBOARDING_ENABLED,
    value: 1,
    description: 'Does onboarding process for owners is enabled or disabled',
  },
]

module.exports = [
  ...APP_LIMITS,
  ...OWNERS_LIMITS,
].map((data) => data)
