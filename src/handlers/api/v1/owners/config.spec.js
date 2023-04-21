const { handler } = require('../../../../services/http')

jest.mock('../../../../services/http')

const httpHandler = require('./config')

describe('GET /v1/owners/config', () => {
  it('should return list of the owners panel configuration', () => {
    const response = {
      data: {},
    }

    const json = jest.fn().mockImplementation((args) => args)

    expect(httpHandler({}, { json })).toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
