const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('property-fees serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'propertyId',
      'feeId',
      'name',
      'rateType',
      'percentage',
      'currency',
      'amount',
      'chargeType',
      'frequency',
      'description',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
