const { handler } = require('../../../../../services/http')
const {
  selectBy: selectPropertyBy,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectBy: selectPropertyImages,
} = require('../../../../../models/v1/property-images/repositories')
const {
  storageFileUrl,
} = require('../../../../../models/v1/storage/files/repositories')
const { PERMITED_COLLECTION_PARAMS, serialize } = require('../../../../../models/v1/properties/serializers')

jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/property-images/repositories')
jest.mock('../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../models/v1/properties/serializers')

const httpHandler = require('./list')

describe('GET /v1/app/properties', () => {
  it('should display all resources', async () => {
    const user = { id: 1, accountId: 1000 }
    const properties = [{ id: 1 }]
    const images = [
      { id: 1, propertyId: 1 },
      { id: 2, propertyId: 1 },
    ]

    const imageUrl = 'imageUrl'
    const data = [{ ...properties[0], mainImage: imageUrl }]

    const json = jest.fn().mockImplementation((args) => args)

    const orderBy = jest.fn().mockResolvedValue(images)
    const whereIn = jest.fn().mockReturnValue({ orderBy })
    const join = jest.fn().mockReturnValue({ whereIn })
    const select = jest.fn().mockReturnValue({ join })

    selectPropertyBy.mockResolvedValue(properties)
    storageFileUrl.mockReturnValue(imageUrl)
    selectPropertyImages.mockReturnValue({ select })
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ accountId: 1000 })
    expect(serialize).toBeCalledWith(PERMITED_COLLECTION_PARAMS, data)
    expect(json).toBeCalledWith({ data })
  })
})
