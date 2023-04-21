const crypto = require('crypto')
const NodeCache = require('node-cache')
const { format } = require('util')

exports.KEY_DEFS = Object.freeze({
  BOOKING_DETAILS: 'accounts.%s.bookings.show.%s',
  BOOKING_GUESTS: 'accounts.%s.bookings.show.%s.guests',
  BOOKING_EXTRAS: 'accounts.%s.bookings.show.%s.extras',
  BOOKINGS_LIST: 'accounts.%s.bookings.list.%s',
  PROPERTY_DETAILS: 'accounts.%s.properties.show.%s',
  PROPERTIES_LIST: 'accounts.%s.properties.list',
  PROPERTIES_CALENDAR: 'accounts.%s.properties.calendar.%s',
  UNITS_LIST: 'accounts.%s.properties.%s.unitTypes.%s.units.list',
  UNIT_TYPE_RATES_LIST: 'accounts.%s.properties.%s.unitTypesRates.%',
  STORAGE_QUOTA: 'accounts.%s.storage.quota',
  STORAGE_FILE_DETAILS: 'accounts.%s.storage.files.show.%s',
  STORAGE_FILES_LIST: 'accounts.%s.storage.files.list.%s',
  STORAGE_FOLDER_DETAILS: 'accounts.%s.storage.folders.show.%s',
  STORAGE_FOLDERS_LIST: 'accounts.%s.storage.folders.list.%s',
  CURRENCY_EXCHANGE_RATES: 'dictionaries.currencyRates.%s',
})

exports.TTL = Object.freeze({
  M5: 300, // 5 minutes
  H2: 7200, // 2 hours
  H12: 43200, // 12 hours
})

const createInstance = () => {
  let client
  return (invalidate = false) => {
    if (client === undefined || invalidate) {
      client = new NodeCache({ stdTTL: exports.TTL.M5 })
    }
    return client
  }
}

exports.getInstance = createInstance()

exports.key = (name, ...args) => {
  const params = args.map((item) => {
    if (item && typeof item === 'object') {
      return crypto.createHash('sha256')
        .update(JSON.stringify(item), 'binary')
        .digest('base64')
    }
    return item
  })

  return format(name, ...params)
}

exports.normalizeKey = (keyName) => keyName
  .replace(/\.+/g, '.')
  .replace(/\.$/, '')

exports.list = () => exports.getInstance()
  .keys()

exports.del = (...args) => {
  const keys = exports.list()

  const patterns = args.flat()
    .map(exports.normalizeKey)

  return patterns.map((pattern) => (
    keys.filter((key) => {
      const keyName = exports.normalizeKey(key)

      if (pattern.endsWith('.*')) {
        return keyName.startsWith(pattern.slice(0, -1))
      }
      return keyName === pattern
    }).map(exports.getInstance().del)
  )).flat()
}

exports.has = (keyName) => exports.getInstance()
  .has(exports.normalizeKey(keyName))

exports.set = (keyName, data, ttl) => exports.getInstance()
  .set(exports.normalizeKey(keyName), data, ttl)

exports.get = (keyName) => exports.getInstance()
  .get(exports.normalizeKey(keyName))

exports.flushAll = () => exports.getInstance()
  .flushAll()

exports.wrap = async (keyName, ...args) => {
  const handler = args.pop()
  const [ttl] = args

  if (!exports.has(keyName)) {
    const data = await handler()

    exports.set(keyName, data, ttl)

    return data
  }
  return exports.get(keyName)
}
