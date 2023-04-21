const createError = require('../services/errors')
const { logInfo } = require('../services/logger')

jest.mock('../services/errors')
jest.mock('../services/logger')

const checkLimit = require('./limits')

describe('limits middleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  const req = {
    user: { id: 1 },
    limits: [{ name: 'limitName', value: 100 }],
  }

  it('should allow a limit', async () => {
    const next = jest.fn()

    await expect(checkLimit(['limitName'])(req, {}, next))
      .resolves.toEqual(next())

    expect(createError).not.toBeCalled()
    expect(next).toBeCalled()
  })

  it('should deny a limit where are no limits', async () => {
    const errorMessage = 'error'

    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)

    await expect(checkLimit(['otherLimit'])({ user: { id: 1 } }, {}, next))
      .resolves.toEqual(errorMessage)

    expect(logInfo).toBeCalledWith({
      message: 'Forbidden',
      payload: { limitName: 'otherLimit', limit: undefined, limits: undefined },
    })
    expect(createError).toBeCalledWith(403)
    expect(next).toBeCalledWith(errorMessage)
  })

  it('should deny a limit', async () => {
    const errorMessage = 'error'

    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)

    await expect(checkLimit(['otherLimit'])(req, {}, next))
      .resolves.toEqual(errorMessage)

    expect(logInfo).toBeCalledWith({
      message: 'Forbidden',
      payload: { limitName: 'otherLimit', limit: undefined, limits: req.limits },
    })
    expect(createError).toBeCalledWith(403)
    expect(next).toBeCalledWith(errorMessage)
  })

  it('should allow using a custom callback', async () => {
    const fn = jest.fn().mockReturnValue(true)
    const next = jest.fn()

    await expect(checkLimit(['limitName', fn])(req, {}, next))
      .resolves.toEqual(next())

    expect(createError).not.toBeCalled()
    expect(next).toBeCalled()
  })

  it('should deny using a custom callback', async () => {
    const errorMessage = 'error'

    const fn = jest.fn().mockReturnValue(false)
    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)

    await expect(checkLimit(['limitName', fn])(req, {}, next))
      .resolves.toEqual(errorMessage)

    expect(createError).toBeCalledWith(403)
    expect(fn).toBeCalledWith(100, req)
    expect(next).toBeCalledWith(errorMessage)
  })

  it('should deny when a custom callback thrown an error', async () => {
    const errorMessage = 'customErrors'

    const fn = jest.fn().mockRejectedValue(errorMessage)
    const next = jest.fn().mockImplementation((args) => args)

    createError.mockReturnValue(errorMessage)

    await expect(checkLimit(['limitName', fn])(req, {}, next))
      .resolves.toEqual(errorMessage)

    expect(createError).not.toBeCalledWith()
    expect(fn).toBeCalledWith(100, req)
    expect(next).toBeCalledWith(errorMessage)
  })
})
