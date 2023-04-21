const { handler } = require('../../../../../services/http')
const {
  selectOneBy: selectPropertyBy,
  completenessDetails: propertyCompleteness,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectChannelManagerBy,
  withAccount,
} = require('../../../../../models/v1/channel-managers/repositories')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/channel-managers/repositories')

const httpHandler = require('./setupProgress')

describe('GET /v1/app/account/setup-progress', () => {
  it('should return an account setup progress of the logged in user', async () => {
    const response = {
      data: {
        rental: {
          details: true,
          location: false,
          photos: false,
          rates: true,
          contactInfo: false,
        },
        channels: {
          channex: false,
        },
      },
    }

    const property = 'property'
    const channex = { enabled: 0 }

    const orderBy = jest.fn().mockResolvedValueOnce(property)
    selectPropertyBy.mockReturnValueOnce({ orderBy })

    propertyCompleteness.mockResolvedValueOnce({
      overview: true,
      location: false,
      photos: false,
      rates: true,
    })

    withAccount.mockImplementation(() => (queryBuilder) => queryBuilder)
    const where = jest.fn().mockResolvedValue(channex)
    selectChannelManagerBy.mockReturnValueOnce({ where })

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ user: { accountId: 1 } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(json).toBeCalledWith(response)
    expect(selectPropertyBy).toBeCalledWith({ accountId: 1 })
    expect(orderBy).toBeCalledWith('createdAt', 'ASC')
    expect(propertyCompleteness).toBeCalledWith(property)
    expect(withAccount).toBeCalledWith(1)
    expect(selectChannelManagerBy).toBeCalled()
    expect(where).toBeCalledWith('name', '=', 'channex')
  })
})
