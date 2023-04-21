const createError = require('../services/errors')

jest.mock('../services/errors')

const phoneVerification = require('./phoneVerification')

describe('phoneVerification middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check if phone is verified', async () => {
    const req = {
      user: { phoneNumberVerifiedAt: Date.now() },
      limits: [{ name: 'account.module.auth.phoneVerification.enabled', value: '1' }],
    }

    const next = jest.fn()

    await expect(phoneVerification(req, {}, next))
      .resolves.toBeUndefined()

    expect(next).toBeCalled()
    expect(createError).not.toBeCalled()
  })

  it('should pass if phone verification limit does not exists', async () => {
    const req = {
      user: { phoneNumberVerifiedAt: Date.now() },
      limits: [],
    }

    const next = jest.fn()

    await expect(phoneVerification(req, {}, next))
      .resolves.toBeUndefined()

    expect(next).toBeCalled()
    expect(createError).not.toBeCalled()
  })

  it('should throw an error if phone is not verified', async () => {
    const req = {
      user: { phoneNumberVerifiedAt: null },
      limits: [{ name: 'account.module.auth.phoneVerification.enabled', value: '1' }],
    }

    const errorMessage = 'Phone Number Unverified'

    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)

    await expect(phoneVerification(req, {}, next))
      .resolves.toEqual(errorMessage)

    expect(createError).toBeCalledWith(422, errorMessage, { code: 'PHONE_NUMBER_UNVERIFIED' })
    expect(next).toBeCalledWith(errorMessage)
  })
})
