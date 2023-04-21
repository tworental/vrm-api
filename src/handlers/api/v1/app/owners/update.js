const createError = require('../../../../../services/errors')
const { CODES, MESSAGES } = require('../../../../../services/errorCodes')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { createTransaction } = require('../../../../../services/database')
const {
  selectOneBy: selectOwnerBy,
  updateById: updateOwnerById,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
  updateBy: updateUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/owners/schema')

module.exports = handler(async ({
  body, user: { accountId }, params: { id },
}, res) => {
  const { units: ids, ...payload } = await validate(body, { schema: UPDATE_SCHEMA })

  /**
   * Checkin whether the owners already exists
   */
  if (!await selectOwnerBy({ accountId, id })) {
    throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
  }

  /**
   * Extra owners validation for preventing duplicate email address in the same account
   */
  if (payload.email) {
    if (await selectOwnerBy({ accountId, email: payload.email }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { email: ['exists'] },
      })
    }
  }

  /**
   * Extra owners validation for preventing duplicate phone number in the same account
   */
  if (payload.phoneNumber) {
    if (await selectOwnerBy({ accountId, phoneNumber: payload.phoneNumber }).where('id', '!=', id)) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { phoneNumber: ['exists'] },
      })
    }
  }

  let unitsIds = []

  if (Array.isArray(ids) && ids.length) {
    unitsIds = await selectUnitsBy({ accountId })
      .where((queryBuilder) => {
        queryBuilder.where({ ownerId: id })
          .orWhere({ ownerId: null })
      })
      .then((items) => items.map((item) => item.id))
  }

  await createTransaction(async (trx) => {
    await updateOwnerById(id, payload, trx)

    if (unitsIds.length) {
      await updateUnitsBy({}, { ownerId: null }, trx)
        .whereIn('id', unitsIds)

      await updateUnitsBy({}, { ownerId: id }, trx)
        .whereIn('id', unitsIds.filter((unitId) => ids.includes(unitId)))
    }
  })

  return res.sendStatus(204)
})
