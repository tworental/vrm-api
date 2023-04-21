const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { signTokenByOwnerJwt } = require('../../../../../services/auth')
const { selectOneWithAccount, updateById, verifyPassword } = require('../../../../../models/v1/owners/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/auth')
jest.mock('../../../../../models/v1/owners/repositories')

const httpHandler = require('./signin')

describe('signin service', () => {
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

  it('should signin owner successfully', async () => {
    const owner = {
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

    selectOneWithAccount.mockResolvedValue(owner)
    signTokenByOwnerJwt.mockResolvedValue(data)
    updateById.mockResolvedValue(owner)
    verifyPassword.mockResolvedValue(data)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }, { json })).resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier, hasPanelAccess: 1 })
    expect(signTokenByOwnerJwt).toBeCalledWith(owner.id, identifier)
    expect(updateById).toBeCalledWith(owner.id, {
      currentSignInIp: clientIp,
      currentSignInAt: new Date(time),
      signInCount: owner.signInCount + 1,
      lastSignInAt: owner.currentSignInAt,
      lastSignInIp: owner.lastSignInIp,
      failedAttempts: 0,
    })
    expect(verifyPassword).toBeCalledWith(owner, password)
  })

  it('should throw an error when a owner is not present', async () => {
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(null)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(401, errorMessage)
  })

  it('should should throw an error if a password is not verified ', async () => {
    const owner = {
      id: 1,
      failedAttempts: 0,
      currentSignInAt: 'abc',
    }
    const errorMessage = 'Invalid Credentials'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(owner)
    updateById.mockResolvedValue(owner)
    verifyPassword.mockReturnValue(null)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(selectOneWithAccount).toBeCalledWith({ email, identifier, hasPanelAccess: 1 })
    expect(updateById).toBeCalledWith(owner.id, {
      currentSignInIp: clientIp,
      currentSignInAt: new Date(time),
      failedAttempts: owner.failedAttempts + 1,
    })
    expect(createError).toBeCalledWith(401, errorMessage)
  })

  it('throw an error if a owner is locked', async () => {
    const owner = {
      id: 1,
      lockedAt: 1,
    }
    const data = 'data'
    const errorMessage = 'Locked'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(owner)
    verifyPassword.mockResolvedValue(data)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage)
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier, hasPanelAccess: 1 })
    expect(verifyPassword).toBeCalledWith(owner, password)
  })

  it('throw an error if a owner is unconfirmed', async () => {
    const owner = {
      id: 1,
      lockedAt: 0,
      confirmedAt: 0,
    }
    const data = 'data'
    const errorMessage = 'Unconfirmed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneWithAccount.mockResolvedValue(owner)
    verifyPassword.mockResolvedValue(data)

    await expect(httpHandler({ body: { email, password }, clientIp, headers }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(403, errorMessage)
    expect(selectOneWithAccount).toBeCalledWith({ email, identifier, hasPanelAccess: 1 })
    expect(verifyPassword).toBeCalledWith(owner, password)
  })
})
