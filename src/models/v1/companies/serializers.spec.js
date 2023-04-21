const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('companies serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'name',
      'type',
      'vatId',
      'registrationNumber',
      'taxId',
      'bankName',
      'bankIban',
      'bankBic',
      'email',
      'phoneNumber',
      'address',
      'city',
      'zip',
      'region',
      'countryCode',
      'discountType',
      'discountValue',
      'isActive',
      'labels',
      'notes',
      'createdAt',
      'updatedAt',
    ], data)
  })

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'name',
      'type',
      'isActive',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
