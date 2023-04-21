const config = require('config')

const { apiUrl } = require('./frontend')

jest.mock('config')
jest.mock('googleapis')
jest.mock('./frontend')

const service = require('./sso')

describe('sso service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('createConnection', () => {
    it('should create an object with default redirectUrl', () => {
      expect(service.createConnection()).toBeDefined()
      expect(config.get).toBeCalledWith('google.oauth.clientId')
      expect(config.get).toBeCalledWith('google.oauth.clientSecret')
      expect(config.get).toBeCalledWith('google.oauth.redirect')
    })
    it('should create an object with provided redirectUrl', () => {
      expect(service.createConnection({ redirectUrl: 'redirect' })).toBeDefined()
      expect(config.get).toBeCalledWith('google.oauth.clientId')
      expect(config.get).toBeCalledWith('google.oauth.clientSecret')
      expect(config.get).not.toBeCalledWith('google.oauth.redirect')
    })
  })

  describe('getGoogleAuthUrl', () => {
    let createConnectionSpy
    let generateAuthUrlSpy

    beforeEach(() => {
      generateAuthUrlSpy = jest.fn().mockReturnValue('url')

      createConnectionSpy = jest.spyOn(service, 'createConnection').mockReturnValue({
        generateAuthUrl: generateAuthUrlSpy,
      })
    })

    it('should generate auth url', () => {
      const state = 'state'
      const redirectUrl = 'redirectUrl'

      apiUrl.mockImplementation((args) => args)

      expect(service.getGoogleAuthUrl({ state, redirectUrl })).toEqual('url')
      expect(createConnectionSpy).toBeCalled()
      expect(apiUrl).toBeCalledWith(redirectUrl)
      expect(generateAuthUrlSpy).toBeCalledWith({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.email',
        redirect_uri: redirectUrl,
        state,
      })
    })
  })

  describe('getGoogleProfileByCode', () => {
    let createConnectionSpy
    let getTokenSpy
    let setCredentialsSpy
    let verifyIdTokenSpy
    let getPayloadSpy

    beforeEach(() => {
      getTokenSpy = jest.fn().mockResolvedValue({ tokens: { id_token: 'id_token' } })
      setCredentialsSpy = jest.fn()
      getPayloadSpy = jest.fn().mockReturnValue({
        displayName: 'displayName',
      })
      verifyIdTokenSpy = jest.fn().mockResolvedValue({
        getPayload: getPayloadSpy,
      })

      createConnectionSpy = jest.spyOn(service, 'createConnection').mockReturnValue({
        getToken: getTokenSpy,
        setCredentials: setCredentialsSpy,
        verifyIdToken: verifyIdTokenSpy,
      })
    })

    it('should return profile', async () => {
      const code = 'code'
      const redirectUrl = 'redirectUrl'

      const profile = {
        displayName: 'displayName',
      }

      apiUrl.mockImplementation((args) => args)

      await expect(service.getGoogleProfileByCode({ code, redirectUrl }))
        .resolves.toEqual(profile)

      expect(apiUrl).toBeCalledWith(redirectUrl)
      expect(createConnectionSpy).toBeCalledWith({
        redirectUrl,
      })
      expect(getTokenSpy).toBeCalledWith(code)
      expect(setCredentialsSpy).toBeCalledWith({ id_token: 'id_token' })
      expect(verifyIdTokenSpy).toBeCalledWith({ idToken: 'id_token' })
      expect(getPayloadSpy).toBeCalled()
    })
  })
})
