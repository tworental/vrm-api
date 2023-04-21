const config = require('config')
const { verify, sign } = require('jsonwebtoken')

const { Unauthorized } = require('./errors')

const signToken = (secret, expiresIn, role) => (subject, issuer) => new Promise(
  (resolve, reject) => sign({ role }, secret, {
    jwtid: Date.now().toString(),
    subject: String(subject),
    issuer,
    expiresIn,
  }, (error, accessToken) => {
    if (error) reject(new Unauthorized(error.message))
    resolve({ accessToken, expiresIn })
  }),
)

const authByJwt = (secret) => (token) => new Promise(
  (resolve, reject) => verify(token, secret, (error, decoded) => {
    if (error) reject(new Unauthorized(error.message))
    resolve(decoded)
  }),
)

exports.parseToken = ({ method, headers, query }) => new Promise((resolve, reject) => {
  if (Object.prototype.hasOwnProperty.call(headers, 'authorization')) {
    const parsedToken = headers.authorization.split('Bearer')

    if (parsedToken.length === 2) {
      return resolve(parsedToken[1].trim())
    }
  } else if (method === 'GET' && query.accessToken && query.accessToken.length > 64) {
    return resolve(query.accessToken)
  }
  return reject(new Unauthorized('Missing or malformed token'))
})

exports.authByUserJwt = authByJwt(config.get('guards.user.secret'))

exports.authByOwnerJwt = authByJwt(config.get('guards.owner.secret'))

exports.authByTenantJwt = authByJwt(config.get('guards.tenant.secret'))

exports.signTokenByUserJwt = signToken(
  config.get('guards.user.secret'),
  config.get('guards.user.accessTokenTtl'),
  config.get('guards.user.roleName'),
)

exports.signTokenByOwnerJwt = signToken(
  config.get('guards.owner.secret'),
  config.get('guards.owner.accessTokenTtl'),
  config.get('guards.owner.roleName'),
)

exports.signTokenByTenantJwt = signToken(
  config.get('guards.tenant.secret'),
  config.get('guards.tenant.accessTokenTtl'),
  config.get('guards.tenant.roleName'),
)
