const config = require('config')

const debugService = require('./debug')

jest.mock('config')

describe('debug service', () => {
  it('should add debug data to request', async () => {
    const data = { message: 'message' }
    const base64 = 'eyJtZXNzYWdlIjoibWVzc2FnZSJ9'
    const header = jest.fn()

    expect(debugService.debugInfo({ header }, data)).toBeUndefined()
    expect(header).toBeCalledWith('debug.key', base64)
    expect(config.get).toHaveBeenNthCalledWith(1, 'debug.enabled')
    expect(config.get).toHaveBeenNthCalledWith(2, 'debug.key')
  })

  it('should do not add debug data to request', async () => {
    const data = { message: 'message' }
    const header = jest.fn()

    config.get.mockReturnValue(false)

    expect(debugService.debugInfo({ header }, data)).toBeUndefined()
    expect(header).not.toBeCalled()
  })
})
