const config = require('config')
const geocoder = require('node-geocoder')

jest.mock('config')
jest.mock('node-geocoder')

const geocodeService = require('./geocode')

describe('geocode service', () => {
  const client = 'client'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('getInstance', () => {
    beforeEach(() => {
      geocoder.mockResolvedValue(client)
    })

    it('should get a new instance of NodeGeocoder', async () => {
      await expect(geocodeService.getInstance()).resolves.toEqual(client)

      expect(geocoder).toBeCalledWith({ provider: 'google', apiKey: 'google.maps.apiKey' })
      expect(config.get).toHaveBeenNthCalledWith(1, 'google.maps.apiKey')
    })

    it('should get the same instance on subsequent calls', async () => {
      await expect(geocodeService.getInstance(true)).resolves.toEqual(client)
      await expect(geocodeService.getInstance()).resolves.toEqual(client)

      expect(geocoder).toBeCalledTimes(1)
    })
  })

  describe('geocode', () => {
    it('get geocode results', async () => {
      const results = 'results'
      const payload = {
        address: 'address',
        country: 'country',
        zipcode: 'zipcode',
      }

      const geocode = jest.fn()

      jest.spyOn(geocodeService, 'getInstance').mockReturnValue({ geocode })

      geocode.mockResolvedValue(results)

      await expect(geocodeService.geocode(payload)).resolves.toEqual(results)

      expect(geocode).toBeCalledWith(payload)
    })
  })
})
