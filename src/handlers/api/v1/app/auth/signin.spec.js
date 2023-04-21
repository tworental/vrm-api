const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { signTokenByUserJwt } = require('../../../../../services/auth')
const { selectOneWithAccount, updateById, verifyPassword } = require('../../../../../models/v1/users/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/auth')
jest.mock('../../../../../models/v1/users/repositories')

const httpHandler = require('./signin')

describe('POST /v1/app/auth/signin', () => {
  const time = 1479427200000
  const email = 'johndoe@domain.com'
  const password = 'pa$$word'
  const clientIp = 123
  const identifier = 'organization'
  const headers = {
    'x-org-id': identifier,
  }

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should signin user successfully', async () => {
    const user = {
      id: 1,
      confirmedAt: 1,
      lockedAt: 0,
      signInCount: 0,
      currentSignInAt: 'abc',
      lastSignInIp: 123,
    }
    const data = 'data'
    const response = { data: 'data' }

    const json = jest.fn().mockImplementation((args) => args)

    selectOneWithAccount.mockResolvedValue(user)
    signTokenByUserJwt.mockResolvedValue(data)
    updateById.mockResolvedValue(user)
    verifyPassword.mockResolvedValue(data)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }, { json })).resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(signTokenByUserJwt).toBeCalledWith(user.id, identifier)
    expect(updateById).toBeCalledWith(user.id, {
      currentSignInIp: clientIp,
      currentSignInAt: new Date(time),
      signInCount: user.signInCount + 1,
      lastSignInAt: user.currentSignInAt,
      lastSignInIp: user.lastSignInIp,
      failedAttempts: 0,
    })
    expect(verifyPassword).toBeCalledWith(user, password)
  })

  it('should throw an error when a user is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(null)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(401, errorMessage, { code: 'AUTH_INVALID_CREDENTIALS' })
  })

  it('should should throw an error if a password is not verified ', async () => {
    const user = {
      id: 1,
      failedAttempts: 0,
      currentSignInAt: 'abc',
    }
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(user)
    updateById.mockResolvedValue(user)
    verifyPassword.mockReturnValue(null)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(updateById).toBeCalledWith(user.id, {
      currentSignInIp: clientIp,
      currentSignInAt: new Date(time),
      failedAttempts: user.failedAttempts + 1,
    })
    expect(createError).toBeCalledWith(401, errorMessage, { code: 'AUTH_INVALID_CREDENTIALS' })
  })

  it('throw an error if a user is locked', async () => {
    const user = {
      id: 1,
      lockedAt: 1,
    }
    const data = 'data'
    const errorMessage = 'Locked'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(user)
    verifyPassword.mockResolvedValue(data)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage, { code: 'ACCOUNT_LOCKED' })
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(verifyPassword).toBeCalledWith(user, password)
  })

  it('throw an error if a user is unconfirmed', async () => {
    const user = {
      id: 1,
      lockedAt: 0,
      confirmedAt: 0,
    }
    const data = 'data'
    const errorMessage = 'Unconfirmed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(user)
    verifyPassword.mockResolvedValue(data)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage, { code: 'ACCOUNT_UNCONFIRMED' })
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier })
    expect(verifyPassword).toBeCalledWith(user, password)
  })
})
