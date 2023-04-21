exports.TABLE_NAME = 'permissions'

exports.ABILITIES = Object.freeze({
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
})

exports.PERMISSIONS = Object.freeze({
  ACCOUNT: 'account',
  BILLINGS: 'billings',
  BOOKINGS: 'bookings',
  INTEGRATIONS: 'integrations',
  DOCUMENTS_INVOICES: 'documentsInvoices',
  // DOCUMENTS_EXPENSES: 'documents.expenses',
  // DOCUMENTS_QUOTES: 'documents.quotes',
  SETTINGS: 'settings',
  OWNERS: 'owners',
  GUESTS: 'guests',
  COMPANIES: 'companies',
  CHANNELS: 'channels',
  PROPERTIES: 'properties',
  STORAGE: 'storage',
  STATISTICS: 'statistics',
  USERS: 'users',
  RATE_SEASONS: 'rateSeasons',
  SALES_CHANNELS: 'salesChannels',
  CUSTOMER_CONTACTS: 'customerContacts',
  SERVICES: 'services',
  FEES: 'fees',
  TAXES: 'taxes',
  WEBSITES: 'websites',
})
