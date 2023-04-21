const { verify } = require('paypal-ipn')

jest.mock('paypal-ipn')

const service = require('./paypal')

describe('paypal service', () => {
  it('should verify paypal request', async () => {
    const message = 'message'
    const body = 'body'

    verify.mockImplementation((_, settings, callback) => {
      callback(null, message)
    })

    await expect(service.verifyIpn(body))
      .resolves.toEqual(message)

    expect(verify).toBeCalledWith(body, { allow_sandbox: true }, expect.any(Function))
  })

  it('should reject an error during verifying paypal request', async () => {
    const error = 'error'
    const body = 'body'

    verify.mockImplementation((_, settings, callback) => {
      callback(error)
    })

    await expect(service.verifyIpn(body))
      .rejects.toEqual(error)

    expect(verify).toBeCalledWith(body, { allow_sandbox: true }, expect.any(Function))
  })
})
