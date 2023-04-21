const { checkQuota } = require('../../../services/authorizers')
const { selectBy } = require('./repositories')

jest.mock('../../../services/authorizers')
jest.mock('./repositories')

const authorizer = require('./authorizers')

describe('unit-types authorizers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should check a qouta authorizer', async () => {
    const req = { params: { propertyId: 1000 } }
    const results = 'results'

    selectBy.mockResolvedValue(results)

    await expect(authorizer.quota[1](req))
      .resolves.toEqual(results)

    expect(checkQuota).toBeCalled()
    expect(selectBy).toBeCalledWith({ propertyId: req.params.propertyId })
    expect(authorizer.quota).toEqual(['account.module.properties.unitTypes.limit', expect.any(Function)])
  })
})
