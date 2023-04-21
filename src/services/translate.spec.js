const config = require('config')
const { v2: { Translate } } = require('@google-cloud/translate')

jest.mock('config')
jest.mock('@google-cloud/translate')

const translateService = require('./translate')

describe('translate service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('getInstance', () => {
    const client = { }

    beforeEach(() => {
      Translate.mockImplementation(() => client)
    })

    it('should get a new instance of Translate', () => {
      expect(translateService.getInstance()).toEqual(client)

      expect(Translate).toBeCalledWith({ key: 'google.translate.apiKey' })
      expect(config.get).toHaveBeenNthCalledWith(1, 'google.translate.apiKey')
    })

    it('should get the same instance on subsequent calls', () => {
      expect(translateService.getInstance(true)).toEqual(client)
      expect(translateService.getInstance()).toEqual(client)

      expect(Translate).toBeCalledTimes(1)
    })
  })

  describe('getLanguagesList', () => {
    it('get languages list', async () => {
      const results = 'results'

      const getLanguages = jest.fn()

      jest.spyOn(translateService, 'getInstance').mockReturnValue({ getLanguages })

      getLanguages.mockResolvedValue([results])

      await expect(translateService.getLanguagesList()).resolves.toEqual(results)

      expect(getLanguages).toBeCalled()
    })
  })

  describe('translate', () => {
    it('get text translation for specific language', async () => {
      const results = 'results'
      const text = 'text'
      const targetLanguage = 'pl'

      const translate = jest.fn()

      jest.spyOn(translateService, 'getInstance').mockReturnValue({ translate })

      translate.mockResolvedValue([results])

      await expect(translateService.translate(text, targetLanguage)).resolves.toEqual(results)

      expect(translate).toBeCalledWith(text, targetLanguage)
    })
  })
})
