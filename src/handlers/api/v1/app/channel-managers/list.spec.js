const { handler } = require('../../../../../services/http')
const { selectBy, withAccount } = require('../../../../../models/v1/channel-managers/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/channel-managers/repositories')

const httpHandler = require('./list')

describe('GET /v1/app/channel-managers', () => {
  const accountId = 'accountId'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should display all resources', async () => {
    const results = [
      { id: 1, name: 'channex' },
    ]

    selectBy.mockReturnValue('select')
    const withAccountFn = jest.fn().mockResolvedValue(results)
    withAccount.mockReturnValue(withAccountFn)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId } }, { json }))
      .resolves.toEqual({ data: results })

    expect(handler).toBeCalled()
    expect(selectBy).toBeCalled()
    expect(withAccount).toBeCalledWith(accountId)
    expect(json).toBeCalledWith({ data: results })
  })
})
