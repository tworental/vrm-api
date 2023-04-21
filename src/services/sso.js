const config = require('config')
const { google } = require('googleapis')

const { apiUrl } = require('./frontend')

exports.createConnection = ({ redirectUrl } = {}) => new google.auth.OAuth2(
  config.get('google.oauth.clientId'),
  config.get('google.oauth.clientSecret'),
  redirectUrl || config.get('google.oauth.redirect'),
)

exports.getGoogleAuthUrl = ({ state, redirectUrl }) => exports.createConnection().generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/userinfo.email',
  redirect_uri: apiUrl(redirectUrl),
  state,
})

exports.getGoogleProfileByCode = async ({ code, redirectUrl }) => {
  const client = exports.createConnection({
    redirectUrl: apiUrl(redirectUrl),
  })

  const token = await client.getToken(code)
  client.setCredentials(token.tokens)

  const login = await client.verifyIdToken({
    idToken: token.tokens.id_token,
  })

  return login.getPayload()
}
