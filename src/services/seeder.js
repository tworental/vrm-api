const DEFAULT_ATTR = 'id'

/* eslint-disable no-await-in-loop */
exports.seed = async (knex, tableName, payload, attr = DEFAULT_ATTR) => {
  for (let i = 0; i < payload.length; i += 1) {
    let value = payload[i][attr]

    if (attr === DEFAULT_ATTR) {
      value = value || (i + 1)
    }

    if (!await knex(tableName).where(attr, '=', value).first()) {
      await knex(tableName).insert(payload[i])
    }
  }
}
