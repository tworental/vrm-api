const config = require('config')

const { logError } = require('./logger')

jest.mock('config')
jest.mock('@slack/web-api')
jest.mock('./logger')

const service = require('./slack')

describe('slack service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('init', () => {
    it('should create an instance', () => {
      config.get.mockImplementation((args) => args)

      expect(service.init()).toBeDefined()
      expect(config.get).toBeCalledWith('slack.token')
    })

    it('should not create an instance if it was cached', () => {
      config.get.mockImplementation((args) => args)

      service.init()

      expect(config.get).not.toBeCalled()
    })
  })

  describe('postMessage', () => {
    it('should return empty promise', async () => {
      config.get.mockImplementation(() => null)

      await expect(service.postMessage('channel', 'text')).resolves.toBeUndefined()
    })

    it('should post message', async () => {
      config.get.mockImplementation((args) => args)

      const postMessage = jest.fn().mockResolvedValue(true)

      jest.spyOn(service, 'init').mockReturnValue({
        chat: { postMessage },
      })

      await expect(service.postMessage('channel', 'text')).resolves.toBeTruthy()

      expect(postMessage).toBeCalledWith({
        text: '*[test]* text',
        channel: 'channel',
        username: 'TwoRentals Bot',
      })
    })

    describe('with changing NODE_ENV', () => {
      let oldEnv

      beforeEach(() => {
        oldEnv = process.env.NODE_ENV

        process.env.NODE_ENV = 'production'
      })

      afterEach(() => {
        process.env.NODE_ENV = oldEnv
      })

      it('should handle error during posting message', async () => {
        config.get.mockImplementation((args) => args)

        const postMessage = jest.fn().mockRejectedValue('error')

        jest.spyOn(service, 'init').mockReturnValue({
          chat: { postMessage },
        })

        await expect(service.postMessage('channel', 'text')).resolves.toBeUndefined()

        expect(postMessage).toBeCalledWith({
          text: ' text',
          channel: 'channel',
          username: 'TwoRentals Bot',
        })

        expect(logError).toBeCalledWith('slack-integration-error', 'error')
      })
    })
  })
})
