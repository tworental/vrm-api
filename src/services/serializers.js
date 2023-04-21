exports.convertToJsonString = (object) => JSON.stringify(object)

exports.coerceToBoolean = (value) => Boolean(value)

exports.applyToFields = (fn, fields, object) => ({
  ...object,
  ...fields.reduce((appliedFields, field) => ({
    ...appliedFields,
    [field]: object[field] ? fn(object[field]) : undefined,
  }), {}),
})

exports.serialize = (allows, data, extra = {}) => {
  const serializeItem = (item) => {
    if (allows.length === 1 && allows[0] === '*') {
      return item
    }

    return Object.entries(item).reduce((acc, [key, value]) => {
      if (allows.includes(key)) {
        acc[key] = value
      }
      return acc
    }, {})
  }

  if (!data) return null

  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...serializeItem(item),
      ...extra,
    }))
  }
  return {
    ...serializeItem(data),
    ...extra,
  }
}
