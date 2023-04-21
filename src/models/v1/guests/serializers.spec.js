const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('guests serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'companyId',
      'name',
      'type',
      'email',
      'phoneNumber',
      'gender',
      'title',
      'firstName',
      'lastName',
      'citizenship',
      'address',
      'city',
      'zip',
      'region',
      'countryCode',
      'documentType',
      'documentNumber',
      'documentIssuedDate',
      'documentExpiryDate',
      'birthDate',
      'birthPlace',
      'labels',
      'parlance',
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
      'companyId',
      'bookingId',
      'name',
      'type',
      'email',
      'phoneNumber',
      'gender',
      'title',
      'citizenship',
      'countryCode',
      'dateArrival',
      'amountTotal',
      'currency',
      'totalGuests',
      'totalNights',
      'firstName',
      'lastName',
      'labels',
      'notes',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
