const { handler } = require('../../../../../services/http')
const {
  selectBy: selectReportsBy,
} = require('../../../../../models/v1/owner-reports/repositories')
const {
  PERMITED_COLLECTION_PARAMS,
  serialize,
} = require('../../../../../models/v1/owner-reports/serializers')

module.exports = handler(async ({ user: { id: ownerId, accountId }, query: { perPage, currentPage } }, res) => {
  const { data, pagination } = await selectReportsBy({ ownerId, accountId })
    .paginate({ perPage: Number(perPage), currentPage: Number(currentPage), isLengthAware: true })

  return res.json({ data: serialize(PERMITED_COLLECTION_PARAMS, data), meta: { pagination } })
})
