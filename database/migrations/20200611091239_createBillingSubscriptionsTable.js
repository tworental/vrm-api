const TABLE_NAME = 'billing_subscriptions'

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('package_id').unsigned().notNull()
  table.string('stripe_customer_id', 100).notNull()
  table.string('stripe_subscription_id', 100).notNull()
  table.string('stripe_product_id', 100).notNull()
  table.string('stripe_price_id', 100).notNull()
  table.string('stripe_payment_method_id', 100).notNull()
  table.string('status', 40)
  table.string('interval', 20)
  table.integer('interval_count', 3).unsigned()
  table.integer('quantity').unsigned()
  table.timestamp('start_date')
  table.timestamp('cancellation_date')
  table.timestamp('current_period_start_date')
  table.timestamp('current_period_end_date')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.unique(['account_id', 'stripe_subscription_id'])

  table.foreign('account_id')
    .references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)
