const { handler } = require('../../../../../services/http')
const { getSignedUrl } = require('../../../../../services/s3')
const {
  selectBy: selectOwnersBy,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/owners/serializers')

module.exports = handler(async ({ user: { accountId } }, res) => {
  const owners = await selectOwnersBy({ accountId })

  const results = await selectUnitsBy({ accountId })
    .whereIn('ownerId', owners.map((owner) => owner.id))

  const units = results.reduce((acc, curr) => ({
    ...acc,
    [curr.ownerId]: [
      ...(acc[curr.ownerId] || []),
      {
        id: curr.id,
        name: curr.name,
        propertyName: curr.propertyName,
        image: null, // TODO: add image support
      },
    ],
  }), {})

  const data = await Promise.all(owners.map(
    async (owner) => serialize(PERMITED_COLLECTION_PARAMS, owner, {
      avatar: await getSignedUrl(owner.avatar),
      units: units[owner.id] || [],
    }),
  ))

  return res.json({ data })
})
