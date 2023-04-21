const config = require('config')
const Vonage = require('@vonage/server-sdk')

const createError = require('./errors')
const { CODES } = require('./errorCodes')
const { camelcaseKeys } = require('./utility')

exports.TOKEN_EXPIRATION_TIME = 60 // 1 minute

/**
 * Check more here:
 * https://developer.nexmo.com/verify/guides/workflows-and-events
 */
const createInstance = () => {
  let client
  return (invalidate = false) => {
    if (client === undefined || invalidate) {
      client = new Vonage({
        apiKey: config.get('mobile.vonage.apiKey'),
        apiSecret: config.get('mobile.vonage.apiSecret'),
      }, { debug: config.get('mobile.debug') })
    }
    return client
  }
}

exports.init = createInstance()

exports.requestVerificationCode = (phoneNumber) => new Promise((resolve, reject) => {
  exports.init().verify.request({
    number: phoneNumber,
    workflow_id: 6,
    code_length: 4,
    pin_expiry: exports.TOKEN_EXPIRATION_TIME,
    brand: config.get('mobile.vonage.brand'),
  }, (err, results) => {
    if (err || !results) return reject(err)
    if (results.status !== '0') reject(camelcaseKeys(results))
    return resolve(camelcaseKeys(results))
  })
})

exports.checkVerificationCode = (requestId, code) => new Promise((resolve, reject) => {
  exports.init().verify.check({
    request_id: requestId,
    code,
  }, (err, results) => {
    if (err || !results) return reject(err)
    if (results.status !== '0') reject(camelcaseKeys(results))
    return resolve(camelcaseKeys(results))
  })
})

exports.cancelVerificationCode = (requestId) => new Promise((resolve, reject) => {
  exports.init().verify.control({
    request_id: requestId,
    cmd: 'cancel',
  }, (err, results) => {
    if (err || !results) return reject(err)
    if (results.status !== '0') reject(camelcaseKeys(results))
    return resolve(camelcaseKeys(results))
  })
})

exports.sendSms = (phoneNumber, content) => new Promise((resolve, reject) => {
  exports.init().message.sendSms(config.get('mobile.vonage.from'), phoneNumber, content, {}, (err, results) => {
    if (err || !results) return reject(err)
    if (results.messages[0].status !== '0') reject(camelcaseKeys(results))
    return resolve(camelcaseKeys(results))
  })
})

exports.throwVonageError = (err) => {
  if (!err.requestId && !err.status) throw err

  const { requestId, status, errorText } = err

  throw createError(400, errorText, {
    code: CODES.REQUEST_FAIL,
    meta: { requestId, status },
    errors: { requestId: ['invalid'] },
  })
}
