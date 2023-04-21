const config = require('config')
const ibantools = require('ibantools')
// const jsvat = require('jsvat')

const createError = require('./errors')
const { MESSAGES, CODES } = require('./errorCodes')
const { validate, formatErrors } = require('./jsonSchema')

const isValidIBAN = {
  keyword: 'isValidIBAN',
  type: 'string',
  schema: false,
  validate: (data) => ibantools.isValidIBAN(ibantools.electronicFormatIBAN(data)),
  error: {
    message: 'Invalid IBAN number',
  },
}

const isValidBIC = {
  keyword: 'isValidBIC',
  type: 'string',
  schema: false,
  validate: (data) => ibantools.isValidBIC(data),
  error: {
    message: 'Invalid BIC',
  },
}

const isValidVAT = {
  keyword: 'isValidVAT',
  type: 'string',
  schema: true,
  validate: (value, data, attr) => {
    // TODO: Think about this solution latter.
    //
    // jsvat.checkVAT(
    //   data,
    //   jsvat.countries.filter(({ codes }) => (
    //     codes.includes(data.substr(0, 2)) || codes.includes(data.substr(0, 3))
    //   )),
    // ).isValid
    if (attr.nullable === true && !data) {
      return true
    }
    return /^[A-Za-z]{2,4}(?=.{2,12}$)[-_s0-9]*(?:[a-zA-Z.][-_s0-9]*){0,2}$/.test(data) === value
  },
  error: {
    message: 'Invalid VAT ID number',
  },
}

exports.validate = async (data, rules, options = {}) => {
  const payload = data || {}
  const validationRules = rules || {}

  const schema = {
    $async: true,
    ...(validationRules.schema || {}),
  }

  const validators = {
    isValidIBAN,
    isValidBIC,
    isValidVAT,
    ...(validationRules.validators || {}),
  }

  try {
    return await validate(payload, { validators, schema }, {
      ...config.get('validation'),
      ...options,
    })
  } catch (error) {
    if (error.errors) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: formatErrors(error.errors),
      })
    }
    throw error
  }
}
