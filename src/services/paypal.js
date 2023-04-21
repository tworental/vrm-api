const { verify } = require('paypal-ipn')

exports.verifyIpn = (body) => new Promise((resolve, reject) => (
  verify(body, { allow_sandbox: true }, (err, message) => {
    if (err) return reject(err)
    return resolve(message)
  })
))
