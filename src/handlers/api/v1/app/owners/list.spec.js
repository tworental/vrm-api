const { handler } = require('../../../../../services/http')
const { getSignedUrl } = require('../../../../../services/s3')
const {
  selectBy: selectOwnersBy,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/owners/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/s3')
jest.mock('../../../../../models/v1/owners/repositories')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/owners/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/owners', () => {
  it('should display all resources', async () => {
    const accountId = 1000

    const user = { id: 1, accountId }
    const owner = { id: 100, avatar: 'avatar' }
    const data = ['owner']
    const response = { data }
    const units = [
      {
        id: 1,
        name: 'Unit 1',
        propertyName: 'Property 1',
        image: null,
      },
      {
        id: 2,
        name: 'Unit 2',
        propertyName: 'Property 1',
        image: null,
      },
    ]

    const json = jest.fn().mockImplementation((args) => args)
    const whereIn = jest.fn().mockResolvedValue([
      {
        id: 1, ownerId: 100, name: 'Unit 1', propertyName: 'Property 1',
      },
      {
        id: 2, ownerId: 100, name: 'Unit 2', propertyName: 'Property 1',
      },
    ])

    selectOwnersBy.mockResolvedValue([owner])
    getSignedUrl.mockResolvedValue('s3avatar')
    selectUnitsBy.mockReturnValue({ whereIn })
    serialize.mockReturnValue(data[0])

    await expect(httpHandler({ user }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(selectOwnersBy).toBeCalledWith({ accountId })
    expect(selectUnitsBy).toBeCalledWith({ accountId })
    expect(whereIn).toBeCalledWith('ownerId', [owner.id])
    expect(getSignedUrl).toBeCalledWith(owner.avatar)
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, owner, { avatar: 's3avatar', units })
    expect(json).toBeCalledWith(response)
  })
})
