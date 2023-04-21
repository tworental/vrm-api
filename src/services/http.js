const qs = require('qs')

const { languageCode } = require('./i18n')

exports.handler = (fn) => async (req, res, next) => {
  try {
    req.files = req.files || {}

    req.headers['x-org-id'] = req.headers['x-org-id'] || null
    req.headers['content-type'] = req.headers['content-type'] || 'application/json'
    req.headers.lang = languageCode(req.headers['accept-language'])
    req.headers.locale = req.headers['accept-language']

    // NOTE: Fix for bodyParser when is content-type == multipart/form-data
    if (req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
      req.body = qs.parse(req.body)
    }

    if (req.query.ids) {
      req.query.ids = Object.values(req.query.ids)
        .filter(Number)
    }

    await fn(req, res, next)
  } catch (error) {
    next(error)
  }
}
