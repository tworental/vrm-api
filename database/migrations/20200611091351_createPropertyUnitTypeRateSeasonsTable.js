const { TABLE_NAME } = require('../../src/models/v1/unit-type-rate-seasons/constants')
const {
  DISCOUNT_TYPES,
  MIN_STAY_DAYS_DEFAULT,
  CANCELLATION_POLICIES,
} = require('../../src/models/v1/unit-type-rates/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('property_unit_type_id').unsigned().notNull()
  table.integer('property_unit_type_rate_id').notNull().unsigned()
  table.string('channex_id', 120).index()

  table.string('name', 100).index().notNull()
  table.date('start_date').notNull()
  table.date('end_date').notNull()
  table.boolean('is_completed').notNull().defaultTo(false)

  table.enum('cancellation_policy', Object.values(CANCELLATION_POLICIES))

  table.boolean('price_weekday_enabled').notNull().defaultTo(true)

  table.boolean('discount_enabled').notNull().defaultTo(false)
  table.boolean('discount_default').notNull().defaultTo(false)
  table.enum('discount_type', Object.values(DISCOUNT_TYPES))
  table.decimal('discount_weekly', 10, 2).unsigned()
  table.decimal('discount_monthly', 10, 2).unsigned()
  table.boolean('discount_custom_enabled').notNull().defaultTo(false)
  table.decimal('discount_custom', 10, 2).unsigned()
  table.integer('discount_custom_period', 4).unsigned()

  table.boolean('min_stay_default').notNull().defaultTo(false)
  table.integer('min_stay_days', 4).notNull().unsigned().defaultTo(MIN_STAY_DAYS_DEFAULT)

  table.boolean('min_stay_weekday_enabled').notNull().defaultTo(false)
  table.boolean('min_stay_weekday_default').notNull().defaultTo(false)
  table.integer('min_stay_weekday_mo', 4).unsigned()
  table.integer('min_stay_weekday_tu', 4).unsigned()
  table.integer('min_stay_weekday_we', 4).unsigned()
  table.integer('min_stay_weekday_th', 4).unsigned()
  table.integer('min_stay_weekday_fr', 4).unsigned()
  table.integer('min_stay_weekday_sa', 4).unsigned()
  table.integer('min_stay_weekday_su', 4).unsigned()

  table.boolean('occupancy_enabled').notNull().defaultTo(false)
  table.boolean('occupancy_default').notNull().defaultTo(false)
  table.integer('occupancy_starts_after_person', 3).unsigned()
  table.decimal('occupancy_extra_charge', 10, 2).unsigned()

  table.boolean('short_stay_enabled').notNull().defaultTo(false)
  table.boolean('short_stay_default').notNull().defaultTo(false)
  table.integer('short_stay_days', 4).unsigned()
  table.decimal('short_stay_extra_charge', 10, 2).unsigned()

  table.boolean('self_service_restrictions_enabled').notNull().defaultTo(false)
  table.boolean('self_service_restrictions_default').notNull().defaultTo(false)
  table.boolean('self_service_checkin_mo')
  table.boolean('self_service_checkin_tu')
  table.boolean('self_service_checkin_we')
  table.boolean('self_service_checkin_th')
  table.boolean('self_service_checkin_fr')
  table.boolean('self_service_checkin_sa')
  table.boolean('self_service_checkin_su')

  table.boolean('self_service_checkout_mo')
  table.boolean('self_service_checkout_tu')
  table.boolean('self_service_checkout_we')
  table.boolean('self_service_checkout_th')
  table.boolean('self_service_checkout_fr')
  table.boolean('self_service_checkout_sa')
  table.boolean('self_service_checkout_su')

  table.boolean('notes_enabled').notNull().defaultTo(false)
  table.text('notes')

  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .withKeyName('ut_rate_seasons_account_id_foreign')

  table.foreign('property_unit_type_id')
    .references('property_unit_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .withKeyName('ut_rate_seasons_ut_id_foreign')

  table.foreign('property_unit_type_rate_id')
    .references('property_unit_type_rates.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
    .withKeyName('ut_rate_seasons_ut_rate_id_foreign')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
