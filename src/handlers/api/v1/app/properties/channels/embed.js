const { handler } = require('../../../../../../services/http')
const { getIframeUrl, getProperty } = require('../../../../../../services/channex')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')

module.exports = handler(async ({
  params: { propertyId }, account: { id: accountId },
}, res) => {
  const property = await selectPropertyBy({ id: propertyId, accountId })

  if (!property || !property.channexId) {
    return res.sendStatus(422)
  }

  const url = await getProperty(property.channexId)
    .then(() => getIframeUrl(property.channexId))

  return res.redirect(url)
})
