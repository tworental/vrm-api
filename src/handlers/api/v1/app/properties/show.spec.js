const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const {
  selectOneBy: selectPropertyBy,
  completenessDetails: propertyCompleteness,
} = require('../../../../../models/v1/properties/repositories')
const {
  selectOneBy: selectPropertyImage,
} = require('../../../../../models/v1/property-images/repositories')
const {
  storageFileUrl,
} = require('../../../../../models/v1/storage/files/repositories')
const { selectBy: selectAmenitiesBy } = require('../../../../../models/v1/property-amenities/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/properties/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/property-images/repositories')
jest.mock('../../../../../models/v1/storage/files/repositories')
jest.mock('../../../../../models/v1/property-amenities/repositories')
jest.mock('../../../../../models/v1/properties/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/properties/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const property = { id }
    const completeness = 'completeness'
    const image = { id: 1 }
    const mainImage = 'imageUrl'
    const amenities = [
      { id: 1, dictAmenityId: 1, count: 100 },
    ]
    const data = 'data'

    const json = jest.fn().mockImplementation((args) => args)

    const orderBy = jest.fn().mockResolvedValue(image)
    const join = jest.fn().mockReturnValue({ orderBy })
    const select = jest.fn().mockReturnValue({ join })

    selectPropertyImage.mockReturnValue({ select })

    selectPropertyBy.mockResolvedValue(property)
    propertyCompleteness.mockResolvedValue(completeness)
    selectAmenitiesBy.mockResolvedValue(amenities)
    storageFileUrl.mockReturnValue(mainImage)
    serialize.mockReturnValue(data)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id, accountId: 100 })
    expect(propertyCompleteness).toBeCalledWith(property)
    expect(selectAmenitiesBy).toBeCalledWith({ propertyId: id })
    expect(selectPropertyImage).toBeCalledWith({ propertyId: id })
    expect(select).toBeCalledWith(['uuid', 'publicUrl'])
    expect(join).toBeCalledWith('storage_files', 'storage_files.id', 'property_images.storage_file_id')
    expect(orderBy).toBeCalledWith('main', 'desc')
    expect(storageFileUrl).toBeCalledWith(image)
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, property, {
      amenities: [{ dictAmenityId: 1, count: 100 }],
      completeness,
      mainImage,
    })
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error if a property does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectPropertyBy).toBeCalledWith({ id, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
