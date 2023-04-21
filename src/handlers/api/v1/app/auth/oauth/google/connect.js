const { handler } = require('../../../../../../../services/http')
const { getGoogleAuthUrl } = require('../../../../../../../services/sso')

module.exports = handler(async ({ user, headers }, res) => {
  const identifier = headers['x-org-id']

  return res.json({
    data: getGoogleAuthUrl({
      state: [identifier, user.id].join('.'),
      redirectUrl: 'auth/oauth/google/retrieve-connect',
    }),
  })
})
