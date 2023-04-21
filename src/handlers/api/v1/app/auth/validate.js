const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { MESSAGES, CODES } = require('../../../../../services/errorCodes')
const { selectOneWithAccount } = require('../../../../../models/v1/users/repositories')
const { selectOneBy: selectOrganizationBy } = require('../../../../../models/v1/accounts/repositories')
const { checkToken } = require('../../../../../models/v1/user-tokens/repositories')

const validators = {
  organization: async ({ identifier }) => {
    const organization = await selectOrganizationBy({ identifier })

    if (!organization) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { identifier: ['notExists'] },
      })
    }
  },

  identifier: async ({ identifier }) => {
    const organization = await selectOrganizationBy({ identifier })

    if (organization) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { identifier: ['exists'] },
      })
    }
  },

  token: async (data) => {
    const {
      email, identifier, type, token,
    } = data

    const user = await selectOneWithAccount({ email, identifier })

    if (!user) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { token: ['invalid'] },
      })
    }

    const userToken = await checkToken(user.id, token, type)

    if (!userToken) {
      throw createError(400, MESSAGES.VALIDATION_FAILED, {
        code: CODES.VALIDATION_FAILED,
        errors: { token: ['invalid'] },
      })
    }
  },
}

const validate = (field) => {
  if (!validators[field]) {
    throw createError(422, 'Invalid Validation Key')
  }
  return validators[field]
}

module.exports = handler(async ({ body, query: { field } }, res) => {
  await validate(field)(body)

  return res.sendStatus(204)
})
