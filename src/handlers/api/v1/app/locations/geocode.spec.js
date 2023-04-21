const { handler } = require('../../../../../services/http')
const { geocode } = require('../../../../../services/geocode')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/geocode')

const httpHandler = require('./geocode')

describe('GET /v1/app/locations/search', () => {
  it('should find an address', async () => {
    const address = 'Zurich'
    const data = 'results'

    const json = jest.fn().mockImplementation((args) => args)

    geocode.mockResolvedValue(data)

    await expect(httpHandler({ query: { address } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(geocode).toBeCalledWith({ address })
    expect(json).toBeCalledWith({ data })
  })
})
