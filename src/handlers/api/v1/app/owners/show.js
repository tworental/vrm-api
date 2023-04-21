const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { getSignedUrl } = require('../../../../../services/s3')
const {
  selectOneBy: selectOwnerBy,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/owners/serializers')

module.exports = handler(async ({ user: { accountId }, params: { id } }, res) => {
  const owner = await selectOwnerBy({ accountId, id })

  if (!owner) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  const results = await selectUnitsBy({ accountId, ownerId: owner.id })

  const avatar = await getSignedUrl(owner.avatar)

  const units = results.map((item) => ({
    id: item.id,
    name: item.name,
    propertyName: item.propertyName,
    image: null, // TODO: add image support
  }))

  const data = await serialize(PERMITED_ITEM_PARAMS, owner, { avatar, units })

  return res.json({ data })
})
