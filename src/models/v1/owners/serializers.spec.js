const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('owners serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'email',
      'phoneNumber',
      'firstName',
      'lastName',
      'gender',
      'birthDate',
      'citizenship',
      'residence',
      'documentType',
      'documentNumber',
      'agencyCommission',
      'hasPanelAccess',
      'hasOnboardingEnabled',
      'parlance',
      'notes',
      'lastSignInAt',
      'lockedAt',
      'confirmedAt',
      'phoneNumberVerifiedAt',
      'createdAt',
      'updatedAt',
    ], data)
  })

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'email',
      'phoneNumber',
      'firstName',
      'lastName',
      'gender',
      'birthDate',
      'citizenship',
      'residence',
      'documentType',
      'documentNumber',
      'agencyCommission',
      'hasPanelAccess',
      'hasOnboardingEnabled',
      'parlance',
      'notes',
      'lastSignInAt',
      'lockedAt',
      'confirmedAt',
      'phoneNumberVerifiedAt',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
