const config = require('config')
const geocoder = require('node-geocoder')

const createInstance = () => {
  let client
  return (invalidate = false) => {
    if (client === undefined || invalidate) {
      client = geocoder({
        provider: 'google',
        apiKey: config.get('google.maps.apiKey'),
      })
    }
    return client
  }
}

exports.getInstance = createInstance()

exports.geocode = ({ address, country, zipcode }) => exports.getInstance().geocode({
  address, country, zipcode,
})
