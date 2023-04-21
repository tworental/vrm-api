const config = require('config')

const {
  TABLE_NAME,
  DATE_FORMATS,
  TIME_FORMATS,
  MEASURING_UNITS,
  DEFAULT_TIMEZONE,
  DEFAULT_LOCALE,
  DEFAULT_LANGUAGE,
} = require('../../src/models/v1/account-settings/constants')

const DEFAULT_CURRENCY = config.get('payments.defaultCurrency')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.string('locale', 5).defaultTo(DEFAULT_LOCALE)
  table.string('timezone', 40).defaultTo(DEFAULT_TIMEZONE)
  table.string('country_code', 2)
  table.string('language', 2).defaultTo(DEFAULT_LANGUAGE)
  table.enum('measuring_units', Object.values(MEASURING_UNITS)).notNull().defaultTo(MEASURING_UNITS.METRIC)
  table.enum('date_format', Object.values(DATE_FORMATS))
  table.enum('time_format', Object.values(TIME_FORMATS)).notNull().defaultTo(TIME_FORMATS.H24)
  table.string('currency', 3).notNull().defaultTo(DEFAULT_CURRENCY)
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
