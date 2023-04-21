const config = require('config')

const { stringify } = require('querystring')
const { format } = require('util')

const parseDomain = (endpoint, subdomain) => (
  /^http:\/\/localhost/.test(endpoint) ? endpoint : format(endpoint, subdomain)
)

exports.apiUrl = (path, params) => {
  const domain = config.get('api.domain')
  const schema = domain.includes('localhost') ? 'http' : 'https'

  return [
    schema, '://', domain, '/v1/app/', path, '?', stringify(params),
  ].join('').replace(/\?$/, '')
}

exports.webhookUrl = (path, params) => {
  const domain = config.get('api.domain')
  const schema = domain.includes('localhost') ? 'http' : 'https'

  return [
    schema, '://', domain, '/webhooks/', path, '?', stringify(params),
  ].join('').replace(/\?$/, '')
}

exports.frontendUrl = (endpoint, subdomain, path = '/', params = {}) => [
  parseDomain(endpoint, subdomain), path, '?', stringify(params),
].join('').replace(/\?$/, '')

exports.domainName = (endpoint, subdomain) => parseDomain(endpoint, subdomain)
  .replace(/^https?:\/\//, '')
