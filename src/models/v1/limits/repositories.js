const { queryBuilder, raw } = require('../../../services/database')

const { TABLE_NAME } = require('./constants')

exports.selectLimits = ({ accountId, packageId }) => queryBuilder(TABLE_NAME)
  .select(['name', raw('IFNULL(limit_accounts.value, IFNULL(limit_packages.value, limits.value)) AS value')])
  .leftJoin(
    queryBuilder('limit_packages').where('package_id', '=', packageId).as('limit_packages'),
    'limits.id',
    'limit_packages.limit_id',
  )
  .leftJoin(
    queryBuilder('limit_accounts').where('account_id', '=', accountId).as('limit_accounts'),
    'limits.id',
    'limit_accounts.limit_id',
  )

exports.getLimitByKey = (key, limits, defaultValue) => {
  const results = (limits || []).find(({ name }) => name === key)

  return results ? results.value : defaultValue
}
