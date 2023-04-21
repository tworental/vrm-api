const { getSignedUrl } = require('../../../services/s3')

jest.mock('../../../services/s3')

const serializers = require('./serializers')

describe('user serializers', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should serialize an user', async () => {
    const data = {
      id: 'id',
      accountId: 'accountId',
      oauth2GoogleId: 'oauth2GoogleId',
      email: 'email',
      phoneNumber: 'phoneNumber',
      firstName: 'firstName',
      lastName: 'lastName',
      fullName: 'fullName',
      isAccountOwner: 'isAccountOwner',
      hasOnboardingEnabled: 'hasOnboardingEnabled',
      settings: {
        userId: 'userId',
        locale: 'locale',
        timezone: 'timezone',
        language: 'language',
      },
      avatar: 'avatar',
      lastSignInAt: 'lastSignInAt',
      lockedAt: 'lockedAt',
      confirmedAt: 'confirmedAt',
      phoneNumberVerifiedAt: 'phoneNumberVerifiedAt',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }

    const extra = { key: 'value' }

    getSignedUrl.mockResolvedValue('presignUrl')

    await expect(serializers.serialize(data, extra)).resolves.toEqual({
      id: data.id,
      oauth2GoogleId: data.oauth2GoogleId,
      email: data.email,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName,
      isAccountOwner: data.isAccountOwner,
      hasOnboardingEnabled: data.hasOnboardingEnabled,
      avatar: 'presignUrl',
      locale: data.settings.locale,
      timezone: data.settings.timezone,
      language: data.settings.language,
      ...extra,
      lastSignInAt: data.lastSignInAt,
      lockedAt: data.lockedAt,
      confirmedAt: data.confirmedAt,
      phoneNumberVerifiedAt: data.phoneNumberVerifiedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })

    expect(getSignedUrl).toBeCalledWith(data.avatar)
  })

  it('should serialize an user without settings', async () => {
    const data = {
      id: 'id',
      accountId: 'accountId',
      email: 'email',
      phoneNumber: 'phoneNumber',
      firstName: 'firstName',
      lastName: 'lastName',
      fullName: 'fullName',
      isAccountOwner: 'isAccountOwner',
      hasOnboardingEnabled: 'hasOnboardingEnabled',
      avatar: 'avatar',
      lastSignInAt: 'lastSignInAt',
      lockedAt: 'lockedAt',
      confirmedAt: 'confirmedAt',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }

    getSignedUrl.mockResolvedValue('presignUrl')

    await expect(serializers.serialize(data)).resolves.toEqual({
      id: data.id,
      email: data.email,
      phoneNumber: data.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName,
      isAccountOwner: data.isAccountOwner,
      hasOnboardingEnabled: data.hasOnboardingEnabled,
      avatar: 'presignUrl',
      lastSignInAt: data.lastSignInAt,
      lockedAt: data.lockedAt,
      confirmedAt: data.confirmedAt,
      phoneNumberVerifiedAt: data.phoneNumberVerifiedAt,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    })

    expect(getSignedUrl).toBeCalledWith(data.avatar)
  })
})
