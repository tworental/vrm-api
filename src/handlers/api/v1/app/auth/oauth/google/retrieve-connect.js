const config = require('config')

const { handler } = require('../../../../../../../services/http')
const cache = require('../../../../../../../services/cacheManager')
const { CODES } = require('../../../../../../../services/errorCodes')
const { getGoogleProfileByCode } = require('../../../../../../../services/sso')
const { frontendUrl } = require('../../../../../../../services/frontend')
const {
  selectOneBy: selectUserBy,
  updateById: updateUserById,
} = require('../../../../../../../models/v1/users/repositories')

module.exports = handler(async (req, res) => {
  const state = req.query.state.split('.')

  const identifier = state[0]
  const userId = state[1]

  const handleRedirect = (params) => {
    const url = frontendUrl(
      config.get('frontend.app.endpoint'),
      identifier,
      config.get('frontend.app.paths.oauthGoogleConnect'),
      params,
    )

    return res.redirect(url)
  }

  if (!req.query.code) {
    return handleRedirect({ error: CODES.AUTH_GOOGLE_ERROR })
  }

  let profile

  try {
    profile = await getGoogleProfileByCode({
      code: req.query.code,
      redirectUrl: 'auth/oauth/google/retrieve-connect',
    })
  } catch (err) {
    return handleRedirect({ error: CODES.AUTH_GOOGLE_ERROR })
  }

  if (!profile) {
    return handleRedirect({ error: CODES.NOT_FOUND })
  }

  const user = await selectUserBy({ id: userId })

  if (!user) {
    return handleRedirect({ error: CODES.NOT_FOUND })
  }

  await updateUserById(user.id, {
    oauth2GoogleId: profile.sub,
  })

  cache.del([
    `accounts.${user.accountId}.*`,
    `accounts.${identifier}.*`,
  ])

  return handleRedirect({ connected: 1 })
})
