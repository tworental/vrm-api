const cache = require('../../../../../../../../services/cacheManager')
const createError = require('../../../../../../../../services/errors')
const { handler } = require('../../../../../../../../services/http')
const { validate } = require('../../../../../../../../services/validate')
const {
  checkVerificationCode,
  throwVonageError,
} = require('../../../../../../../../services/vonage')
const {
  updateBy: updateUserBy,
} = require('../../../../../../../../models/v1/users/repositories')
const {
  deleteBy: deleteTokenBy,
  selectLastBy: selectLastTokenBy,
} = require('../../../../../../../../models/v1/user-tokens/repositories')
const { VERIFICATION_SCHEMA } = require('../../../../../../../../models/v1/user-tokens/schema')

jest.mock('../../../../../../../../services/cacheManager')
jest.mock('../../../../../../../../services/errors')
jest.mock('../../../../../../../../services/http')
jest.mock('../../../../../../../../services/validate')
jest.mock('../../../../../../../../services/vonage')
jest.mock('../../../../../../../../models/v1/users/repositories')
jest.mock('../../../../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./confirm')

describe('POST /v1/app/auth/account/verification/email/confirm', () => {
  const time = 1479427200000

  const id = 'id'
  const accountId = 'accountId'
  const body = 'body'

  const code = 'code'
  const token = 'token'
  const userToken = 'userToken'
  const phoneNumber = 'phoneNumber'

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should allow to confirm an account', async () => {
    const statusCode = 202

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({ code, phoneNumber, token })
    selectLastTokenBy.mockResolvedValue({ token: userToken })
    checkVerificationCode.mockResolvedValue()
    updateUserBy.mockResolvedValue()

    await expect(httpHandler({ body, user: { id, accountId } }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: VERIFICATION_SCHEMA })
    expect(selectLastTokenBy).toBeCalledWith({
      userId: id,
      token,
      value: phoneNumber,
      type: 'phoneVerification',
    })
    expect(createError).not.toBeCalled()
    expect(checkVerificationCode).toBeCalledWith(userToken, code)
    expect(updateUserBy).toBeCalledWith({ id }, { phoneNumberVerifiedAt: new Date(time), phoneNumber })
    expect(deleteTokenBy).toBeCalledWith({ userId: id, type: 'phoneVerification' })
    expect(throwVonageError).not.toBeCalled()
    expect(cache.del).toBeCalledWith(`accounts.${accountId}.users.${id}`)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error if verification code is wrong', async () => {
    const errorMessage = 'Wrong Code'

    throwVonageError.mockImplementation((err) => {
      throw new Error(err)
    })

    validate.mockResolvedValue({ code, phoneNumber, token })
    selectLastTokenBy.mockResolvedValue({ token: userToken })
    checkVerificationCode.mockRejectedValue(errorMessage)

    await expect(httpHandler({ body, user: { id } }, { }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: VERIFICATION_SCHEMA })
    expect(selectLastTokenBy).toBeCalledWith({
      userId: id,
      token,
      value: phoneNumber,
      type: 'phoneVerification',
    })
    expect(createError).not.toBeCalled()
    expect(checkVerificationCode).toBeCalledWith(userToken, code)
    expect(updateUserBy).not.toBeCalled()
    expect(throwVonageError).toBeCalledWith(errorMessage)
  })

  it('should throw an error if a token is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({ code, phoneNumber, token })
    selectLastTokenBy.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { id } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { code: ['invalid'] },
    })
  })
})
