const createError = require('./errors')

jest.mock('./errors')

const authorizer = require('./authorizers')

describe('authorizers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('checkModule', () => {
    it('should be truthy', () => {
      expect(authorizer.checkModule(true)).toBeTruthy()
      expect(authorizer.checkModule(1)).toBeTruthy()
      expect(authorizer.checkModule('1')).toBeTruthy()
    })

    it('should be falsy', () => {
      expect(authorizer.checkModule(0)).toBeFalsy()
      expect(authorizer.checkModule(false)).toBeFalsy()
    })
  })

  describe('checkQuota', () => {
    const value = 1

    it('should be truthy', async () => {
      const req = { user: { accountId: 1 } }

      const handler = jest.fn().mockResolvedValue([])

      await expect(authorizer.checkQuota(handler)(value, req))
        .resolves.toBeTruthy()

      expect(handler).toBeCalledWith(req, value)
      expect(createError).not.toBeCalled()
    })

    it('should throw an unauthorized error', async () => {
      const errorMessage = 'Unauthorized'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const handler = jest.fn()

      await expect(authorizer.checkQuota(handler)(value, {}))
        .rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(401, 'Unauthorized', { code: 'UNAUTHORIZED' })
      expect(handler).not.toBeCalled()
    })

    it('should throw a quota exceeded error', async () => {
      const errorMessage = 'Unauthorized'

      const req = { user: { accountId: 1 } }

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const handler = jest.fn().mockResolvedValue(['item1', 'item2'])

      await expect(authorizer.checkQuota(handler)(value, req))
        .rejects.toThrow(errorMessage)

      expect(handler).toBeCalledWith(req, value)
      expect(createError).toBeCalledWith(422, 'Quota exceeded', { code: 'QUOTA_EXCEEDED' })
    })
  })
})
