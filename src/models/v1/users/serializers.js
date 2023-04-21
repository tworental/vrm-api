const { getSignedUrl } = require('../../../services/s3')

const serializeSettings = (settings) => (settings ? {
  locale: settings.locale,
  timezone: settings.timezone,
  language: settings.language,
} : {})

exports.serialize = async (data, extra = {}) => ({
  id: data.id,
  oauth2GoogleId: data.oauth2GoogleId,
  email: data.email,
  phoneNumber: data.phoneNumber,
  firstName: data.firstName,
  lastName: data.lastName,
  fullName: data.fullName,
  isAccountOwner: data.isAccountOwner,
  hasOnboardingEnabled: data.hasOnboardingEnabled,
  avatar: await getSignedUrl(data.avatar),
  ...serializeSettings(data.settings),
  ...extra,
  lastSignInAt: data.lastSignInAt,
  lockedAt: data.lockedAt,
  confirmedAt: data.confirmedAt,
  phoneNumberVerifiedAt: data.phoneNumberVerifiedAt,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
})
