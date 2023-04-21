const APP_LIMITS = {
  APP_SETTINGS_ENABLED: 'account.module.settings.enabled',
  APP_ONBOARDING_ENABLED: 'account.module.onboarding.enabled',
  APP_BILLINGS_ENABLED: 'account.module.billings.enabled',
  APP_PHONE_VERIFICATION_ENABLED: 'account.module.auth.phoneVerification.enabled',
  APP_LANGUAGES_LIST: 'account.module.languages.list',
  APP_LANGUAGES_DEFAULT: 'account.module.languages.default',
  APP_STORAGE_ENABLED: 'account.module.storage.enabled',
  APP_STORAGE_QUOTA: 'account.module.storage.quota',
  APP_STORAGE_FILES_MAX_FILE: 'account.module.storage.files.maxSize',
  APP_TEAM_ENABLED: 'account.module.team.enabled',
  APP_TEAM_SIZE_LIMIT: 'account.module.team.limit',
  APP_OWNERS_ENABLED: 'account.module.owners.enabled',
  APP_GUESTS_ENABLED: 'account.module.guests.enabled',
  APP_COMPANIES_ENABLED: 'account.module.companies.enabled',
  APP_BOOKINGS_ENABLED: 'account.module.bookings.enabled',
  APP_BOOKINGS_CALENDAR_ENABLED: 'account.module.calendar.enabled',
  APP_STATISTICS_ENABLED: 'account.module.statistics.enabled',
  APP_WEBSITE_BUILDER_ENABLED: 'account.module.websites.enabled',
  APP_DOCUMENTS_ENABLED: 'account.module.documents.enabled',
  APP_DOCUMENTS_INVOICES_ENABLED: 'account.module.documents.invoices.enabled',
  APP_DOCUMENTS_INVOICES_LANGUAGES_LIST: 'account.module.documents.invoices.languages.list',
  APP_INTEGRATIONS_ENABLED: 'account.module.integrations.enabled',
  APP_PROPERTIES_ENABLED: 'account.module.properties.enabled',
  APP_PROPERTIES_SIZE_LIMIT: 'account.module.properties.limit',
  APP_PROPERTIES_HOTEL_MODE_ENABLED: 'account.module.properties.hotelMode.enabled',
  APP_PROPERTIES_UNIT_TYPES_ENABLED: 'account.module.properties.unitTypes.enabled',
  APP_PROPERTIES_UNIT_TYPES_SIZE_LIMIT: 'account.module.properties.unitTypes.limit',
  APP_PROPERTIES_UNITS_ENABLED: 'account.module.properties.units.enabled',
  APP_PROPERTIES_UNITS_SIZE_LIMIT: 'account.module.properties.units.limit',
  APP_PROPERTIES_UNIT_TYPES_SEASONS_SIZE_LIMIT: 'account.module.properties.unitTypes.rateSeasons.limit',
  APP_CHANNELS_ENABLED: 'account.module.channels.enabled',
  APP_CHANNELS_CHANNEX_ENABLED: 'account.module.channels.channex.enabled',
  APP_SERVICES_ENABLED: 'account.module.services.enabled',
  APP_SERVICES_SIZE_LIMIT: 'account.module.services.limit',
  APP_SERVICES_REMINDERS_ENABLED: 'account.module.services.reminders.enabled',
  APP_SERVICES_REMINDERS_SIZE_LIMIT: 'account.module.services.reminders.limit',
  APP_FEES_ENABLED: 'account.module.fees.enabled',
  APP_FEES_SIZE_LIMIT: 'account.module.fees.limit',
  APP_TAXES_ENABLED: 'account.module.taxes.enabled',
  APP_TAXES_SIZE_LIMIT: 'account.module.taxes.limit',
  APP_RATE_SEASONS_ENABLED: 'account.module.rateSeasons.enabled',
  APP_RATE_SEASONS_SIZE_LIMIT: 'account.module.rateSeasons.limit',
  APP_SALES_CHANNELS_ENABLED: 'account.module.salesChannels.enabled',
}

const OWNERS_LIMITS = {
  OWNERS_ONBOARDING_ENABLED: 'owners.module.onboarding.enabled',
  OWNERS_PHONE_VERIFICATION_ENABLED: 'owners.module.auth.phoneVerification.enabled',
  OWNERS_LANGUAGES_LIST: 'owners.module.languages.list',
  OWNERS_LANGUAGES_DEFAULT: 'owners.module.languages.default',
}

const TENANTS_LIMITS = {}

exports.LIMITS = Object.freeze({
  ...APP_LIMITS,
  ...OWNERS_LIMITS,
  ...TENANTS_LIMITS,
})

exports.TABLE_NAME = 'limits'
