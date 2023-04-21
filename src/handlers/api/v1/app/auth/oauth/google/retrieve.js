const config = require('config')

const { handler } = require('../../../../../../../services/http')
const { CODES } = require('../../../../../../../services/errorCodes')
const { signTokenByUserJwt } = require('../../../../../../../services/auth')
const { getGoogleProfileByCode } = require('../../../../../../../services/sso')
const { frontendUrl } = require('../../../../../../../services/frontend')
const { selectOneBy: selectUserBy } = require('../../../../../../../models/v1/users/repositories')

module.exports = handler(async (req, res) => {
  const state = req.query.state.split('.')

  const identifier = state[0]
  const userId = state[1]

  const handleRedirect = (params) => {
    const url = frontendUrl(
      config.get('frontend.app.endpoint'),
      identifier,
      config.get('frontend.app.paths.oauthGoogle'),
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
      redirectUrl: 'auth/oauth/google/retrieve',
    })
  } catch (err) {
    return handleRedirect({ error: CODES.AUTH_GOOGLE_ERROR })
  }

  if (!profile) {
    return handleRedirect({ error: CODES.NOT_FOUND })
  }

  const user = await selectUserBy({ id: userId, oauth2GoogleId: profile.sub })

  if (!user) {
    return handleRedirect({ error: CODES.NOT_FOUND })
  }

  if (user.lockedAt) {
    return handleRedirect({ error: CODES.ACCOUNT_LOCKED })
  }

  if (!user.confirmedAt) {
    return handleRedirect({ error: CODES.ACCOUNT_UNCONFIRMED })
  }

  const data = await signTokenByUserJwt(user.id, identifier)

  return handleRedirect(data)
})
