const config = require('config')

const { handler } = require('../../../../../../../services/http')
const { signTokenByUserJwt } = require('../../../../../../../services/auth')
const { getGoogleProfileByCode } = require('../../../../../../../services/sso')
const { frontendUrl } = require('../../../../../../../services/frontend')
const {
  selectOneBy: selectUserBy,
} = require('../../../../../../../models/v1/users/repositories')

jest.mock('config')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/auth')
jest.mock('../../../../../../../services/sso')
jest.mock('../../../../../../../services/frontend')
jest.mock('../../../../../../../models/v1/users/repositories')

const httpHandler = require('./retrieve')

describe('GET /v1/app/auth/oauth/google/retrieve', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return redirect with accessToken', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }
    const accessToken = 'token'
    const expiresIn = 'expiresIn'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue({ email: 'email', sub: '123123' })
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1, confirmedAt: new Date() })
    signTokenByUserJwt.mockResolvedValue({ accessToken, expiresIn })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(handler).toBeCalled()
    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { accessToken, expiresIn },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
    expect(selectUserBy).toBeCalledWith({ id: '1', oauth2GoogleId: '123123' })
    expect(signTokenByUserJwt).toBeCalledWith(1, identifier)
  })

  it('should return redirect with AUTH_GOOGLE_ERROR if code is not provided', async () => {
    const identifier = 'identifier'
    const code = ''
    const query = { state: [identifier, 1].join('.'), code }
    const error = 'AUTH_GOOGLE_ERROR'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue({ email: 'email', sub: '123123' })
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1, confirmedAt: new Date() })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { error },
    )
  })

  it('should return redirect with AUTH_GOOGLE_ERROR if profile has an error', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }
    const error = 'AUTH_GOOGLE_ERROR'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockImplementation(() => {
      throw new Error()
    })
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1, confirmedAt: new Date() })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { error },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
  })

  it('should return redirect with NOT_FOUND if profile does not exist', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }
    const error = 'NOT_FOUND'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue(null)
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1, confirmedAt: new Date() })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { error },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
  })

  it('should return redirect with NOT_FOUND if user does not exist', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }
    const error = 'NOT_FOUND'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue({ email: 'email', sub: '123123' })
    selectUserBy.mockResolvedValue(null)

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { error },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
    expect(selectUserBy).toBeCalledWith({ id: '1', oauth2GoogleId: '123123' })
  })

  it('should return redirect with ACCOUNT_LOCKED if user has lockedAt', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }
    const error = 'ACCOUNT_LOCKED'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue({ email: 'email', sub: '123123' })
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1, lockedAt: new Date() })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { error },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
    expect(selectUserBy).toBeCalledWith({ id: '1', oauth2GoogleId: '123123' })
  })

  it('should return redirect with ACCOUNT_UNCONFIRMED  if user does not have confirmedAt', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }
    const error = 'ACCOUNT_UNCONFIRMED'

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue({ email: 'email', sub: '123123' })
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1 })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { error },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
    expect(selectUserBy).toBeCalledWith({ id: '1', oauth2GoogleId: '123123' })
  })
})
