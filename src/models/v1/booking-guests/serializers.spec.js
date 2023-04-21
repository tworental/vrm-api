const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('booking-guests serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'guestId',
      'bookingId',
      'vatType',
      'type',
      'title',
      'fullName',
      'email',
      'phoneNumber',
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
      'guestId',
      'bookingId',
      'vatType',
      'type',
      'title',
      'fullName',
      'email',
      'phoneNumber',
      'notes',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
