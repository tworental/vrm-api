const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('units serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'propertyId',
      'propertyUnitTypeId',
      'ownerId',
      'isActive',
      'isCompleted',
      'status',
      'priority',
      'name',
      'floor',
      'area',
      'areaUnit',
      'color',
      'outOfService',
      'createdAt',
      'updatedAt',
    ], data)
  })

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'propertyId',
      'propertyUnitTypeId',
      'ownerId',
      'isActive',
      'isCompleted',
      'status',
      'priority',
      'name',
      'floor',
      'area',
      'areaUnit',
      'color',
      'outOfService',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
