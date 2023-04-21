const { select } = require('../../../services/database')
const dao = require('../../../services/dao')

jest.mock('../../../services/dao')
jest.mock('../../../services/database')

const repository = require('./repositories')

describe('property-images repositories', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should initialize a DAO', async () => {
    const model = {
      tableName: 'property_images',
      storageDir: 'properties',
      methods: {
        withFiles: expect.any(Function),
        storageFiles: expect.any(Function),
        shiftImagePositions: expect.any(Function),
      },
    }
    expect(repository).toEqual(model)
    expect(dao).toBeCalledWith(model)
  })

  it('should call method function', async () => {
    const propertyId = 'propertyId'
    const propertyUnitTypeId = 'propertyUnitTypeId'
    const propertyUnitTypeUnitId = 'propertyUnitTypeUnitId'
    const results = 'results'

    const join = jest.fn().mockResolvedValue(results)
    const knexSelect = jest.fn().mockReturnValue({ join })
    const orderBy = jest.fn().mockReturnValue({ select: knexSelect })

    select.mockReturnValue({ orderBy })

    await expect(repository.methods.storageFiles(propertyId, propertyUnitTypeId, propertyUnitTypeUnitId))
      .resolves.toEqual(results)

    expect(select).toBeCalledWith('property_images', { propertyId, propertyUnitTypeId, propertyUnitTypeUnitId })
    expect(knexSelect).toBeCalledWith([
      'property_images.*',
      'storage_files.path',
      'storage_files.publicUrl',
      'storage_files.uuid',
    ])
    expect(join).toBeCalledWith('storage_files', 'storage_files.id', 'property_images.storage_file_id')
    expect(orderBy).toBeCalledWith('position', 'ASC')
  })
})
