const config = require('config')
const { get } = require('./request')

jest.mock('config')
jest.mock('./request')

const channexService = require('./channex')

describe('channex service', () => {
  const token = 'apiKey'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('getHealthProperties', () => {
    it('get list of health properties', async () => {
      const results = 'results'
      const propertyId = 'propertyId'

      config.get.mockReturnValue(token)

      get.mockResolvedValue(results)

      await expect(channexService.getHealthProperties(propertyId)).resolves.toEqual(results)

      expect(get).toBeCalledWith(`channex.url/api/v1/properties/${propertyId}/health`, {
        'user-api-key': token,
      })
    })
  })
})
