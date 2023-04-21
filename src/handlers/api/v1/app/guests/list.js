const { handler } = require('../../../../../services/http')
const {
  tableName,
  withBooking,
  selectBy,
} = require('../../../../../models/v1/guests/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/guests/serializers')

module.exports = handler(async ({ user: { accountId }, query: { perPage = 10, currentPage = 1, search } }, res) => {
  const { data, pagination } = await withBooking(
    selectBy()
      .where((queryBuilder) => {
        if (search) {
          queryBuilder.whereRaw(`TRIM(CONCAT(first_name, " ", last_name)) LIKE "%${search}%"`)
        }
      })
      .where(`${tableName}.account_id`, '=', accountId),
  ).paginate({ perPage, currentPage, isLengthAware: true })

  return res.json({
    data: serialize(PERMITED_COLLECTION_PARAMS, data),
    meta: { pagination },
  })
})
