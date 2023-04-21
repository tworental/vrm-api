const { handler } = require('../../../../services/http')

jest.mock('../../../../services/http')

const httpHandler = require('./config')

describe('GET /v1/app/config', () => {
  it('should return list of the account configuration', () => {
    const response = {
      data: {
        version: process.env.npm_package_version,
        google: {
          oauth: {
            clientId: 'google.oauth.clientId',
          },
          maps: {
            apiKey: 'google.maps.apiKey',
          },
        },
        payments: {
          apiVersion: 'payments.stripe.version',
          stripePublicKey: 'payments.stripe.apiPublicKey',
          defaultCurrency: 'payments.defaultCurrency',
        },
      },
    }

    const json = jest.fn().mockImplementation((args) => args)

    expect(httpHandler({}, { json })).toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
