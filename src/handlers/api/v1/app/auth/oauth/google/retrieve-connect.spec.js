const config = require('config')

const { handler } = require('../../../../../../../services/http')
const cache = require('../../../../../../../services/cacheManager')
const { getGoogleProfileByCode } = require('../../../../../../../services/sso')
const { frontendUrl } = require('../../../../../../../services/frontend')
const {
  selectOneBy: selectUserBy,
  updateById: updateUserById,
} = require('../../../../../../../models/v1/users/repositories')

jest.mock('config')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/cacheManager')
jest.mock('../../../../../../../services/sso')
jest.mock('../../../../../../../services/frontend')
jest.mock('../../../../../../../models/v1/users/repositories')

const httpHandler = require('./retrieve-connect')

describe('GET /v1/app/auth/oauth/google/retrieve-connect', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return redirect with connected', async () => {
    const identifier = 'identifier'
    const code = 'code'
    const query = { state: [identifier, 1].join('.'), code }

    config.get.mockReturnValue('config')
    frontendUrl.mockReturnValueOnce('url')

    const redirect = jest.fn().mockImplementation((args) => args)

    getGoogleProfileByCode.mockResolvedValue({ email: 'email', sub: '123123' })
    selectUserBy.mockResolvedValue({ id: 1, accountId: 1, confirmedAt: new Date() })

    await expect(httpHandler({ query }, { redirect }))
      .resolves.toEqual('url')

    expect(handler).toBeCalled()
    expect(redirect).toBeCalledWith('url')
    expect(frontendUrl).toBeCalledWith(
      'config',
      identifier,
      'config',
      { connected: 1 },
    )
    expect(getGoogleProfileByCode).toBeCalledWith({
      code,
      redirectUrl: 'auth/oauth/google/retrieve-connect',
    })
    expect(selectUserBy).toBeCalledWith({ id: '1' })
    expect(updateUserById).toBeCalledWith(1, { oauth2GoogleId: '123123' })
    expect(cache.del).toBeCalledWith([
      'accounts.1.*',
      'accounts.identifier.*',
    ])
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

  it('should return redirect with AUTH_GOOGLE_ERROR if profile is with error', async () => {
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
      redirectUrl: 'auth/oauth/google/retrieve-connect',
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
      redirectUrl: 'auth/oauth/google/retrieve-connect',
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
      redirectUrl: 'auth/oauth/google/retrieve-connect',
    })
    expect(selectUserBy).toBeCalledWith({ id: '1' })
  })
})
