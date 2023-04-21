const fetch = require('node-fetch')

const createError = require('./errors')
const { logInfo } = require('./logger')

const req = (method, url, body, headers = {}) => {
  logInfo({
    message: 'Send HTTP Request',
    url,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  })

  return fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  }).then(async (res) => {
    const data = await res.json()

    if (!res.ok) {
      throw createError(res.status, res.statusText, data)
    }
    return data
  })
}

exports.get = (url, headers) => req('GET', url, undefined, headers)

exports.post = (url, body, headers) => req('POST', url, body, headers)

exports.put = (url, body, headers) => req('PUT', url, body, headers)

exports.patch = (url, body, headers) => req('PATCH', url, body, headers)

exports.delete = (url, headers) => req('DELETE', url, null, headers)
