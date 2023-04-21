const httpHandler = require('./healthz')

describe('GET /healthz', () => {
  it('should returns 200 status', () => {
    const end = jest.fn()
    const status = jest.fn().mockReturnValue({ end })

    expect(httpHandler({}, { status })).toBeUndefined()

    expect(status).toBeCalledWith(200)
    expect(end).toBeCalled()
  })
})
