const config = require('config')
const knex = require('knex')
const { attachPaginate } = require('knex-paginate')

const { camelcaseKeys } = require('./utility')
const { logDebug, logInfo } = require('./logger')

const PROTECTED_ATTRS = Object.freeze({
  DELETED: '__deleted',
})

const createConnection = () => {
  let connection

  return (invalidate = false) => {
    if (connection === undefined || invalidate) {
      const checkIsNull = (field, callback) => {
        const value = field.string()

        if (value === null) {
          return null
        }
        return callback(value)
      }

      const castJson = (value) => {
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      }
      const castDate = (value) => value.split('T')[0]
      const castNumber = (value) => Number(value)

      const typeCast = (field, next) => {
        switch (field.type) {
          case 'DATE':
            return checkIsNull(field, castDate)
          case 'LONG':
          case 'NEWDECIMAL':
            return checkIsNull(field, castNumber)
          case 'JSON':
          case 'BLOB':
            return checkIsNull(field, castJson)
          default:
            return next()
        }
      }

      const postProcessResponse = (result) => {
        if (Array.isArray(result)) {
          return result.map((row) => camelcaseKeys(row))
        }
        return camelcaseKeys(result)
      }

      const wrapIdentifier = (value, origImpl) => origImpl(
        value.replace(/([A-Z])/g, '_$1').toLowerCase(),
      )

      connection = knex({
        ...config.get('database'),
        wrapIdentifier,
        postProcessResponse,
        connection: {
          ...config.get('database.connection'),
          typeCast,
        },
      })

      attachPaginate()

      connection.on('query', ({
        method, options, sql, bindings,
      }) => logInfo('sql-query-fired', {
        method,
        options,
        sql,
        bindings,
      }))

      connection.on('query-response', (response) => logDebug('sql-query-response-received', response))
    }
    return connection
  }
}

const wrapConditions = (object = {}) => Object.entries(object)
  .reduce((acc, [key, value]) => {
    if (value !== undefined && !Object.values(PROTECTED_ATTRS).includes(key)) {
      switch (value) {
        case false: acc[key] = 0; break
        default: acc[key] = value || null; break
      }
    }
    return acc
  }, {})

const normalizeParams = (object = {}) => Object.entries(object)
  .reduce((acc, [key, value]) => {
    switch (value) {
      case '':
        acc[key] = null
        break

      default:
        acc[key] = value
        break
    }

    return acc
  }, {})

exports.PROTECTED_ATTRS = PROTECTED_ATTRS

exports.getConnection = createConnection()

exports.raw = (...args) => exports.getConnection().raw(...args)

exports.createTransaction = (handler) => exports.getConnection()
  .transaction(handler)

exports.queryBuilder = (table, trx) => {
  const connection = exports.getConnection()(table)

  if (trx) {
    return connection.transacting(trx)
  }
  return connection
}

exports.sanitizePayload = (data, callback) => {
  const payload = Object.entries(data)
    .filter(([, value]) => value !== undefined)

  if (payload.length) {
    return callback(Object.fromEntries(payload))
  }
  return Promise.resolve()
}

exports.insert = (table, data, trx) => exports
  .queryBuilder(table, trx)
  .insert(normalizeParams(data))
  .into(table)
  .then(([id]) => id)

exports.update = (table, data, condition, trx) => (
  Object.entries(data).filter(([, v]) => typeof v !== 'undefined').length
    ? exports.queryBuilder(table, trx)
      .where(wrapConditions(condition))
      .update(normalizeParams(data))
    : null
)

exports.remove = (table, condition, trx) => exports
  .queryBuilder(table, trx)
  .where(wrapConditions(condition))
  .into(table)
  .del()

exports.select = (table, condition, trx) => exports
  .queryBuilder(table, trx)
  .select(`${table}.*`)
  .from(table)
  .where(wrapConditions(condition))

exports.selectOne = (table, condition, trx) => exports
  .select(table, condition, trx)
  .first()

exports.sum = (table, fields, condition, trx) => exports
  .queryBuilder(table, trx)
  .sum({ sum: fields })
  .where(wrapConditions(condition))
  .first()
