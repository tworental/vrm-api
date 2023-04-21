const { handler } = require('../../../../../services/http')
const { selectAll } = require('../../../../../models/v1/dict-countries/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/dict-countries/repositories')

const httpHandler = require('./countries')

describe('GET /v1/app/dictionaries/countries', () => {
  it('should return countries list', async () => {
    const data = 'data'
    const response = { data }

    const json = jest.fn().mockImplementation((args) => args)

    selectAll.mockReturnValue(data)

    await expect(httpHandler({}, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectAll).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
