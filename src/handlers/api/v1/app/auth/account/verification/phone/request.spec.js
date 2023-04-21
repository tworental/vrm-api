const createError = require('../../../../../../../../services/errors')
const { handler } = require('../../../../../../../../services/http')
const {
  requestVerificationCode,
  cancelVerificationCode,
  throwVonageError,
} = require('../../../../../../../../services/vonage')
const {
  create: createToken,
  deleteBy: deleteTokenBy,
  selectLastBy: selectLastTokenBy,
} = require('../../../../../../../../models/v1/user-tokens/repositories')

jest.mock('../../../../../../../../services/errors')
jest.mock('../../../../../../../../services/http')
jest.mock('../../../../../../../../services/vonage')
jest.mock('../../../../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./request')

describe('POST /v1/app/auth/account/verification/phone/request', () => {
  const time = 1479427200000

  const phoneNumber = 'phoneNumber'

  const id = 'id'
  const body = { phoneNumber }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should allow to resend a confirmation request', async () => {
    const statusCode = 202

    const requestId = 'requestId'
    const lastVerificationToken = {
      id: 1,
      token: 'lastToken',
    }

    const results = {
      data: {
        token: requestId,
        expiresAt: 60,
      },
    }

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    selectLastTokenBy.mockResolvedValue(lastVerificationToken)
    cancelVerificationCode.mockResolvedValue()
    deleteTokenBy.mockResolvedValue()
    requestVerificationCode.mockResolvedValue({ requestId })
    createToken.mockResolvedValue()

    await expect(httpHandler({ body, user: { id } }, { status }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(createError).not.toBeCalled()
    expect(selectLastTokenBy).toBeCalledWith({
      userId: id,
      value: phoneNumber,
      type: 'phoneVerification',
    })
    expect(cancelVerificationCode).toBeCalledWith(lastVerificationToken.token)
    expect(deleteTokenBy).toBeCalledWith({ id: lastVerificationToken.id })
    expect(requestVerificationCode).toBeCalledWith(phoneNumber)
    expect(createToken).toBeCalledWith({
      userId: id,
      token: requestId,
      value: phoneNumber,
      type: 'phoneVerification',
      expiresAt: new Date(time + 60 * 1000),
    })
    expect(throwVonageError).not.toBeCalled()
    expect(status).toBeCalledWith(statusCode)
    expect(json).toBeCalledWith(results)
  })

  it('should throw an error if verification code is wrong', async () => {
    const errorMessage = 'Wrong Code'

    const json = jest.fn().mockImplementation((args) => args)
    const status = jest.fn().mockReturnValue({ json })

    throwVonageError.mockImplementation((err) => {
      throw new Error(err)
    })

    selectLastTokenBy.mockResolvedValue()
    cancelVerificationCode.mockResolvedValue()
    deleteTokenBy.mockResolvedValue()
    requestVerificationCode.mockRejectedValue(errorMessage)

    await expect(httpHandler({ body, user: { id } }, { status }))
      .rejects.toThrow(errorMessage)

    expect(createError).not.toBeCalled()
    expect(selectLastTokenBy).toBeCalledWith({
      userId: id,
      value: phoneNumber,
      type: 'phoneVerification',
    })
    expect(cancelVerificationCode).not.toBeCalled()
    expect(deleteTokenBy).not.toBeCalled()
    expect(requestVerificationCode).toBeCalledWith(phoneNumber)
    expect(createToken).not.toBeCalled()
    expect(throwVonageError).toBeCalledWith(errorMessage)
    expect(status).not.toBeCalled()
  })

  it('should throw an error if phoneNumber does not exists', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ body: { }, user: { id } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(400, 'Validation Failed', {
      code: 'VALIDATION_FAILED',
      errors: { phoneNumber: ['required'] },
    })
  })
})
