const { handler } = require('../../../../../services/http')

jest.mock('../../../../../services/http')

const httpHandler = require('./delete')

describe('DELETE /v1/app/account', () => {
  it('should delete a resource', () => {
    const account = 'account'
    const response = { data: account }

    const json = jest.fn().mockImplementation((args) => args)

    expect(httpHandler({ account }, { json })).toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
  })
})
