const { handler } = require('../../../../../../../services/http')
const { getGoogleAuthUrl } = require('../../../../../../../services/sso')

jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/sso')

const httpHandler = require('./connect')

describe('POST /v1/app/auth/oauth/google/connect', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return google url', async () => {
    const identifier = 'identifier'

    const headers = { 'x-org-id': identifier }
    const user = { id: 1 }

    getGoogleAuthUrl.mockReturnValueOnce('url')

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user, headers }, { json }))
      .resolves.toEqual({ data: 'url' })

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith({
      data: 'url',
    })
    expect(getGoogleAuthUrl).toBeCalledWith({
      state: [identifier, user.id].join('.'),
      redirectUrl: 'auth/oauth/google/retrieve-connect',
    })
  })
})
