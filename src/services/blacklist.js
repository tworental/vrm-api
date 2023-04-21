const config = require('config')

exports.isEmailBlacklisted = (email) => Boolean(
  config.get('blacklist.emails').find((entry) => email.indexOf(entry) > -1),
)

exports.isIpBlacklisted = (ip) => Boolean(
  config.get('blacklist.ips').includes(ip),
)
