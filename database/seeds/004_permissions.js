const { seed } = require('../../src/services/seeder')
const { TABLE_NAME, PERMISSIONS } = require('../../src/models/v1/permissions/constants')

/**
 * Ability definitions
 *
 * @structure:
 *  [ABILITY NAME, ALLOW READ, ALLOW WRITE, ALLOW DELETE]
 */
const abilities = [
  [PERMISSIONS.ACCOUNT, true, true, false],
  [PERMISSIONS.BILLINGS, true, true, false],
  [PERMISSIONS.BOOKINGS, true, true, true],
  [PERMISSIONS.INTEGRATIONS, true, true, true],
  [PERMISSIONS.DOCUMENTS_INVOICES, true, true, true],
  // [PERMISSIONS.DOCUMENTS_EXPENSES, true, true, true],
  // [PERMISSIONS.DOCUMENTS_QUOTES, true, true, true],
  [PERMISSIONS.OWNERS, true, true, true],
  [PERMISSIONS.PROPERTIES, true, true, true],
  [PERMISSIONS.STORAGE, true, true, true],
  [PERMISSIONS.STATISTICS, true, true, true],
  [PERMISSIONS.USERS, true, true, true],
  [PERMISSIONS.CHANNELS, true, true, true],
  // [PERMISSIONS.WEBSITES, true, true, true],
  [PERMISSIONS.GUESTS, true, true, true],
  [PERMISSIONS.COMPANIES, true, true, true],
  [PERMISSIONS.SETTINGS, true, true, true],
  [PERMISSIONS.SERVICES, true, true, true],
  [PERMISSIONS.FEES, true, true, true],
  [PERMISSIONS.TAXES, true, true, true],
  [PERMISSIONS.RATE_SEASONS, true, true, true],
  [PERMISSIONS.SALES_CHANNELS, true, true, true],
  [PERMISSIONS.CUSTOMER_CONTACTS, true, true, false],
]

exports.seed = (knex) => seed(knex, TABLE_NAME, abilities.map(([name, read, write, remove]) => ({
  name,
  allow_read: Boolean(read),
  allow_write: Boolean(write),
  allow_delete: Boolean(remove),
})))
