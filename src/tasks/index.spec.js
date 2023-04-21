const minimist = require('minimist')

const { logError } = require('../services/logger')
const stripe = require('./stripe')
const exchangerateapi = require('./exchangerateapi')

const task = require('./index')

jest.mock('minimist')
jest.mock('../services/logger')
jest.mock('./stripe')
jest.mock('./exchangerateapi')

describe('running task', () => {
  let mockProcessExit

  beforeEach(() => {
    mockProcessExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should call exchange rate api', async () => {
    const name = 'exchangerateapi'
    const params = [name, 'param1', 'param2']

    process.argv = ['task', '--', ...params]

    exchangerateapi.mockResolvedValue()

    minimist.mockReturnValue({
      _: params,
    })

    await expect(task()).resolves.toBeUndefined()

    expect(minimist).toBeCalledWith(params)
    expect(exchangerateapi).toBeCalledWith('param1', 'param2')
    expect(logError).not.toBeCalled()
    expect(mockProcessExit).toBeCalledWith(0)
  })

  it('should call stripe api', async () => {
    const name = 'stripe'
    const params = [name, 'param1', 'param2']

    process.argv = ['task', '--', ...params]

    stripe.mockResolvedValue()

    minimist.mockReturnValue({
      _: params,
    })

    await expect(task()).resolves.toBeUndefined()

    expect(minimist).toBeCalledWith(params)
    expect(exchangerateapi).not.toBeCalled()
    expect(stripe).toBeCalledWith('param1', 'param2')
    expect(logError).not.toBeCalled()
    expect(mockProcessExit).toBeCalledWith(0)
  })

  it('should log error', async () => {
    const name = 'anyparams'
    const params = [name]

    process.argv = ['task', '--', ...params]

    minimist.mockReturnValue({
      _: params,
    })

    await expect(task()).resolves.toBeUndefined()

    expect(minimist).toBeCalledWith(params)
    expect(exchangerateapi).not.toBeCalled()
    expect(logError).toBeCalled()
    expect(mockProcessExit).toBeCalledWith(0)
  })
})
