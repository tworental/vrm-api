#!/usr/bin/env node

const { init } = require('../../services/stripe')
const { PACKAGES } = require('../../models/v1/packages/constants')
const { selectBy, updateBy } = require('../../models/v1/packages/repositories')

const CURRENCY = 'EUR'
const VERSION_ID = 'v1'

const FIXTURES = [
  {
    name: PACKAGES.BASIC,
    prices: [
      {
        name: 'monthly',
        interval: 'month',
        tiers: [
          { up_to: 10, unit_amount: 1800 },
          { up_to: 50, unit_amount: 1600 },
          { up_to: 100, unit_amount: 1200 },
          { up_to: 'inf', unit_amount: 1000 },
        ],
      },
      {
        name: 'yearly',
        interval: 'year',
        tiers: [
          { up_to: 10, unit_amount: 1600 },
          { up_to: 50, unit_amount: 1400 },
          { up_to: 100, unit_amount: 1000 },
          { up_to: 'inf', unit_amount: 800 },
        ],
      },
    ],
  },
  {
    name: PACKAGES.PROFESSIONAL,
    prices: [
      {
        name: 'monthly',
        interval: 'month',
        tiers: [
          { up_to: 10, unit_amount: 2400 },
          { up_to: 50, unit_amount: 2200 },
          { up_to: 100, unit_amount: 1800 },
          { up_to: 'inf', unit_amount: 1600 },
        ],
      },
      {
        name: 'yearly',
        interval: 'year',
        tiers: [
          { up_to: 10, unit_amount: 2200 },
          { up_to: 50, unit_amount: 2000 },
          { up_to: 100, unit_amount: 1600 },
          { up_to: 'inf', unit_amount: 1400 },
        ],
      },
    ],
  },
  {
    name: PACKAGES.ENTERPRISE,
    prices: [
      {
        name: 'monthly',
        interval: 'month',
        tiers: [
          { up_to: 10, unit_amount: 3000 },
          { up_to: 50, unit_amount: 2800 },
          { up_to: 100, unit_amount: 2400 },
          { up_to: 'inf', unit_amount: 2000 },
        ],
      },
      {
        name: 'yearly',
        interval: 'year',
        tiers: [
          { up_to: 10, unit_amount: 2800 },
          { up_to: 50, unit_amount: 2600 },
          { up_to: 100, unit_amount: 2200 },
          { up_to: 'inf', unit_amount: 1800 },
        ],
      },
    ],
  },
]

module.exports = async () => {
  const stripe = init()

  const packages = await selectBy()

  const products = await stripe.products.list({ limit: 100 })
    .then(({ data }) => data)

  return Promise.all(
    FIXTURES.map(async (fixtureProduct, index) => {
      const packageProduct = packages.find(({ name }) => name === fixtureProduct.name)

      let product = products.find(({ metadata }) => metadata.packageName === fixtureProduct.name)

      const name = fixtureProduct.name.charAt(0).toUpperCase()
        + fixtureProduct.name.slice(1)

      const payload = {
        name,
        description: packageProduct.description || `The ${name} package with extra features`,
        unit_label: name,
        metadata: {
          packageId: packageProduct.id || (index + 1),
          packageName: fixtureProduct.name,
          version: VERSION_ID,
          label: process.env.PRIVATE_LABEL_ID,
        },
      }

      if (!product) {
        product = await stripe.products.create(payload)
      } else {
        await stripe.products.update(product.id, payload)
      }

      await updateBy({ id: packageProduct.id }, { stripeId: product.id })

      const prices = await stripe.prices.list({ product: product.id, limit: 100 })
        .then(({ data }) => data)

      await Promise.all(
        fixtureProduct.prices.map(async (fixturePrice) => {
          const price = prices.find(({ recurring }) => recurring.interval === fixturePrice.interval)

          const data = {
            product: product.id,
            tiers_mode: 'volume',
            billing_scheme: 'tiered',
            currency: CURRENCY,
            tiers: fixturePrice.tiers,
            recurring: {
              interval: fixturePrice.interval,
            },
            metadata: {
              packageId: packageProduct.id || (index + 1),
              packageName: fixtureProduct.name,
              version: VERSION_ID,
              label: process.env.PRIVATE_LABEL_ID,
            },
          }

          if (!price) {
            await stripe.prices.create(data)
          } else {
            await stripe.prices.update(price.id, { metadata: data.metadata })
          }
        }),
      )
    }),
  )
}
