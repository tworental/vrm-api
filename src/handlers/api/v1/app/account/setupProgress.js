const { handler } = require('../../../../../services/http')

const {
  selectOneBy: selectPropertyBy,
  completenessDetails: propertyCompleteness,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectChannelManagerBy,
  withAccount,
} = require('../../../../../models/v1/channel-managers/repositories')
const { CHANNEL_MANAGERS } = require('../../../../../models/v1/channel-managers/constants')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const property = await selectPropertyBy({ accountId })
    .orderBy('createdAt', 'ASC')

  const completeness = await propertyCompleteness(property)

  const channex = await withAccount(accountId)(
    selectChannelManagerBy()
      .where('name', '=', CHANNEL_MANAGERS.CHANNEX),
  )

  const data = {
    rental: {
      details: completeness.overview,
      location: completeness.location,
      photos: completeness.photos,
      rates: completeness.rates,
      contactInfo: false,
    },
    // website: {
    //   assigned: false,
    //   domain: false,
    //   content: false,
    //   published: false,
    // },
    // payments: {
    //   gateway: true,
    //   paypal: false,
    // },
    channels: {
      channex: Boolean(channex && channex.enabled),
    },
  }

  return res.json({ data })
})
