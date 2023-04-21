const createError = require('../../../services/errors')
const { CODES, MESSAGES } = require('../../../services/errorCodes')

const { TYPES } = require('./constants')
const {
  CREATE_SCHEMA: CREATE_FEE_SCHEMA,
  UPDATE_SCHEMA: UPDATE_FEE_SCHEMA,
} = require('../fees/schema')
const {
  CREATE_SCHEMA: CREATE_TAX_SCHEMA,
  UPDATE_SCHEMA: UPDATE_TAX_SCHEMA,
} = require('../taxes/schema')
const {
  CREATE_SCHEMA: CREATE_SERVICE_SCHEMA,
  UPDATE_SCHEMA: UPDATE_SERVICE_SCHEMA,
} = require('../booking-services/schema')

exports.createSchema = (type) => {
  switch (type) {
    case TYPES.fees:
      return CREATE_FEE_SCHEMA

    case TYPES.taxes:
      return CREATE_TAX_SCHEMA

    case TYPES.services:
      return CREATE_SERVICE_SCHEMA

    default:
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { extrasType: ['invalid'] },
      })
  }
}

exports.updateSchema = (type) => {
  switch (type) {
    case TYPES.fees:
      return UPDATE_FEE_SCHEMA

    case TYPES.taxes:
      return UPDATE_TAX_SCHEMA

    case TYPES.services:
      return UPDATE_SERVICE_SCHEMA

    default:
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { extrasType: ['invalid'] },
      })
  }
}
