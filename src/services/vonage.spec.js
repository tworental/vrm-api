const config = require('config')
const Vonage = require('@vonage/server-sdk')

jest.mock('config')
jest.mock('@vonage/server-sdk')

const vonageService = require('./vonage')

describe('vonage service', () => {
  afterEach(() => jest.clearAllMocks())

  describe('init', () => {
    const client = { }

    beforeEach(() => {
      Vonage.mockImplementation(() => client)
    })

    it('should get a new instance of Vonage', async () => {
      expect(vonageService.init()).toEqual(client)

      expect(Vonage).toBeCalledWith({
        apiKey: 'mobile.vonage.apiKey',
        apiSecret: 'mobile.vonage.apiSecret',
      }, { debug: 'mobile.debug' })

      expect(config.get).toHaveBeenNthCalledWith(1, 'mobile.vonage.apiKey')
      expect(config.get).toHaveBeenNthCalledWith(2, 'mobile.vonage.apiSecret')
      expect(config.get).toHaveBeenNthCalledWith(3, 'mobile.debug')
    })

    it('should get the same instance on subsequent calls', () => {
      expect(vonageService.init(true)).toEqual(client)
      expect(vonageService.init()).toEqual(client)

      expect(Vonage).toBeCalledTimes(1)
    })
  })

  describe('requestVerificationCode', () => {
    const phoneNumber = 123456

    it('should request verification code', async () => {
      const results = { status: '0' }

      const request = jest.fn().mockImplementation(
        (options, callback) => callback(undefined, results),
      )

      const initMock = jest.spyOn(vonageService, 'init').mockReturnValue({
        verify: { request },
      })

      await expect(vonageService.requestVerificationCode(phoneNumber))
        .resolves.toEqual(results)

      expect(initMock).toBeCalled()
      expect(request).toBeCalledWith({
        number: phoneNumber,
        workflow_id: 6,
        code_length: 4,
        pin_expiry: 60,
        brand: 'mobile.vonage.brand',
      }, expect.any(Function))
      expect(config.get).toBeCalledWith('mobile.vonage.brand')
    })

    it('should fail to request code', async () => {
      const error = new Error('failed')

      const request = jest.fn().mockImplementation(
        (options, callback) => callback(error, undefined),
      )

      const initMock = jest.spyOn(vonageService, 'init').mockReturnValue({
        verify: { request },
      })

      await expect(vonageService.requestVerificationCode(phoneNumber))
        .rejects.toThrow(error)

      expect(initMock).toBeCalled()
      expect(request).toBeCalledWith({
        number: phoneNumber,
        workflow_id: 6,
        code_length: 4,
        pin_expiry: 60,
        brand: 'mobile.vonage.brand',
      }, expect.any(Function))
      expect(config.get).toBeCalledWith('mobile.vonage.brand')
    })
  })

  describe('checkVerificationCode', () => {
    const requestId = 'id'
    const code = 1234

    it('should check verification code', async () => {
      const results = { status: '0' }

      const check = jest.fn().mockImplementation(
        (options, callback) => callback(undefined, results),
      )

      const initMock = jest.spyOn(vonageService, 'init').mockReturnValue({
        verify: { check },
      })

      await expect(vonageService.checkVerificationCode(requestId, code))
        .resolves.toEqual(results)

      expect(initMock).toBeCalled()
      expect(check).toBeCalledWith({
        request_id: requestId,
        code,
      }, expect.any(Function))
    })

    it('should fail to verify code', async () => {
      const error = new Error('failed')

      const check = jest.fn().mockImplementation(
        (options, callback) => callback(error, undefined),
      )

      const initMock = jest.spyOn(vonageService, 'init').mockReturnValue({
        verify: { check },
      })

      await expect(vonageService.checkVerificationCode(requestId, code)).rejects.toThrow(error)

      expect(initMock).toBeCalled()
      expect(check).toBeCalledWith({
        request_id: requestId,
        code,
      }, expect.any(Function))
    })
  })
})
