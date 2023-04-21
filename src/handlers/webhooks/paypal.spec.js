const { handler } = require('../../services/http')
const { verifyIpn } = require('../../services/paypal')

jest.mock('../../services/http')
jest.mock('../../services/paypal')

const httpHandler = require('./paypal')

describe('POST /webhooks/paypal/ipn', () => {
  it('should verify request', async () => {
    const results = 200
    const body = 'body'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ body }, { sendStatus }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(verifyIpn).toBeCalledWith(body)
    expect(sendStatus).toBeCalledWith(results)
  })
})
