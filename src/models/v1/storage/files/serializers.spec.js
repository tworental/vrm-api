const { serialize } = require('../../../../services/serializers')

jest.mock('../../../../services/serializers')

const serializers = require('./serializers')

describe('storage-files serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'folderId',
      'uuid',
      'originalFileName',
      'size',
      'ext',
      'path',
      'starred',
      'labels',
      'notes',
      'mimeType',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ], data)
  })

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'folderId',
      'uuid',
      'originalFileName',
      'size',
      'ext',
      'path',
      'starred',
      'labels',
      'notes',
      'mimeType',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ], data)
  })
})
