const { handler } = require('../../../../../../../services/http')
const { getGoogleAuthUrl } = require('../../../../../../../services/sso')

jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../services/sso')

const httpHandler = require('./request')

describe('POST /v1/app/auth/oauth/google/request', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should return google url', async () => {
    const identifier = 'identifier'

    const headers = { 'x-org-id': identifier }

    getGoogleAuthUrl.mockReturnValueOnce('url')

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ headers }, { json }))
      .resolves.toEqual({ data: 'url' })

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith({
      data: 'url',
    })
    expect(getGoogleAuthUrl).toBeCalledWith({
      state: identifier,
      redirectUrl: 'auth/oauth/google/retrieve',
    })
  })
})
