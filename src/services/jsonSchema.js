const { default: Ajv } = require('ajv')
const addFormats = require('ajv-formats')
const addKeywords = require('ajv-keywords')

const flattenRequired = (error) => {
  let customError = error

  if (error.keyword === 'required') {
    customError = {
      ...error,
      instancePath: `${error.instancePath}.${error.params.missingProperty}`,
    }
  }

  return {
    ...customError,
    instancePath: customError.instancePath.replace(/\//g, '.').replace(/^\./, ''),
  }
}

const combineInstancePath = (errors, error) => {
  if (Object.prototype.hasOwnProperty.call(errors, error.instancePath)) {
    return {
      ...errors,
      [error.instancePath]: [
        ...errors[error.instancePath],
        error,
      ],
    }
  }
  return {
    ...errors,
    [error.instancePath]: [error],
  }
}

exports.normaliseError = (errors) => errors
  .map(flattenRequired)
  .reduce(combineInstancePath, {})

exports.formatErrors = (errors) => Object.entries(errors)
  .reduce((acc, [key, values]) => {
    acc[key] = values.map(({ keyword, params, message }) => {
      const nameKeywords = [keyword]

      if (params[keyword]) {
        nameKeywords.push(params[keyword].replace(/,/g, '_or_'))
      }

      return { name: nameKeywords.join('.'), message, params }
    })
    return acc
  }, {})

exports.validate = async (data, validationRules, options = {}) => {
  const ajv = new Ajv(options)

  addFormats(ajv)
  addKeywords(ajv, ['transform'])

  Object.entries(validationRules.validators || {}).forEach(
    ([, validator]) => {
      ajv.addKeyword(validator)
    },
  )

  try {
    return await ajv.validate(validationRules.schema, data)
  } catch (error) {
    if (error.errors) {
      throw new Ajv.ValidationError(
        exports.normaliseError(error.errors),
      )
    }
    throw error
  }
}
