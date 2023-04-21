const crypto = require('crypto')
const prettyBytes = require('pretty-bytes')

const stripe = require('../../../../../../services/stripe')
const { handler } = require('../../../../../../services/http')
const { selectBy } = require('../../../../../../models/v1/packages/repositories')
const { serialize } = require('../../../../../../models/v1/stripe/plans/serializers')
const { LIMITS } = require('../../../../../../models/v1/limits/constants')
const { PACKAGES } = require('../../../../../../models/v1/packages/constants')

const limits = require('../../../../../../__fixtures__/limits')
const limitPackages = require('../../../../../../__fixtures__/limitPackages')

const WHITELIST_FEATURES = {
  main: [
    LIMITS.APP_STORAGE_ENABLED,
    LIMITS.APP_STORAGE_QUOTA,
    LIMITS.APP_TEAM_ENABLED,
    LIMITS.APP_TEAM_SIZE_LIMIT,
    LIMITS.APP_OWNERS_ENABLED,
    LIMITS.APP_RATE_SEASONS_SIZE_LIMIT,
    LIMITS.APP_DOCUMENTS_INVOICES_ENABLED,
    LIMITS.APP_STATISTICS_ENABLED,
    LIMITS.APP_WEBSITE_BUILDER_ENABLED,
    LIMITS.APP_INTEGRATIONS_ENABLED,
    LIMITS.APP_SERVICES_ENABLED,
    LIMITS.APP_SERVICES_SIZE_LIMIT,
    LIMITS.APP_SERVICES_REMINDERS_ENABLED,
    LIMITS.APP_SERVICES_REMINDERS_SIZE_LIMIT,
    LIMITS.APP_FEES_ENABLED,
    LIMITS.APP_FEES_SIZE_LIMIT,
    LIMITS.APP_TAXES_ENABLED,
    LIMITS.APP_TAXES_SIZE_LIMIT,
    LIMITS.APP_PROPERTIES_SIZE_LIMIT,
    LIMITS.APP_PROPERTIES_UNIT_TYPES_SIZE_LIMIT,
    LIMITS.APP_PROPERTIES_UNITS_SIZE_LIMIT,
    LIMITS.APP_PROPERTIES_UNIT_TYPES_SEASONS_SIZE_LIMIT,
  ],
  channels: [
    LIMITS.APP_CHANNELS_ENABLED,
    LIMITS.APP_CHANNELS_CHANNEX_ENABLED,
  ],
}

module.exports = handler(async (req, res) => {
  const stripeIds = await selectBy()
    .then((packages) => packages.map(({ stripeId }) => stripeId))

  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.tiers', 'data.product'],
  })

  const DEFAULT_VALUES = limits.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {})

  const PACKAGE_LIMITS = Object.entries(limitPackages).reduce((acc, [packageName, entries]) => ({
    ...acc,
    [packageName]: {
      ...(acc[packageName] || DEFAULT_VALUES),
      ...entries,
    },
  }), {})

  const FEATURES = Object.entries(PACKAGE_LIMITS).reduce((acc, [packageName, entries]) => {
    acc[packageName] = Object.entries(WHITELIST_FEATURES).map(([group, features], index) => (
      features.map((name) => {
        let value = ''

        switch (name.split('.').splice(-1)[0]) {
          case 'enabled':
            value = Number(entries[name]) === 1
            break

          case 'limit':
            value = Number(entries[name])
            break

          case 'quota':
            value = prettyBytes(entries[name])
            break

          default:
            value = entries[name]
            break
        }

        return {
          id: crypto.createHash('md5').update([packageName, group, index].join('-')).digest('hex'),
          name,
          group,
          value,
        }
      })
    )).flat()
    return acc
  }, {})

  const data = prices.data.filter(
    (item) => stripeIds.includes(item.product.id),
  ).map((results) => {
    const popular = (PACKAGES.PROFESSIONAL === results.product.metadata.packageName)
    const features = FEATURES[results.product.metadata.packageName]

    return { ...serialize(results), popular, features }
  })

  return res.json({ data })
})
