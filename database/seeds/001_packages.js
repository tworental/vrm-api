const { init } = require('../../src/services/stripe')
const { seed } = require('../../src/services/seeder')
const { TABLE_NAME } = require('../../src/models/v1/packages/constants')
const packages = require('../../src/__fixtures__/packages')

exports.seed = async (knex) => {
  const stripe = init()

  const products = await stripe.products.list()
    .then(({ data }) => data.reduce((acc, { id, metadata }) => {
      if (metadata.packageName) {
        acc[metadata.packageName] = id
      }
      return acc
    }, {}))

  return seed(knex, TABLE_NAME, packages.map((item) => ({ ...item, stripe_id: products[item.name] })))
}
