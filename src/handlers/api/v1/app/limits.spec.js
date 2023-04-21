const { handler } = require('../../../../services/http')

jest.mock('../../../../services/http')

const httpHandler = require('./limits')

describe('GET /v1/app/limits', () => {
  it('should return list of the limits', () => {
    const limits = [{ id: 1 }]
    const response = { data: limits }

    const json = jest.fn().mockImplementation((args) => args)

    expect(httpHandler({ limits }, { json })).toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
