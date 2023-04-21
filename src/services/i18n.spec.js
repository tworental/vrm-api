const config = require('config')
const { getLanguageCode } = require('locale-code')

jest.mock('config')
jest.mock('locale-code')

const { languageCode } = require('./i18n')

describe('i18n service', () => {
  afterEach(jest.clearAllMocks)

  beforeEach(() => {
    config.get.mockImplementation((key) => {
      const options = {
        'locales.defaultLangCode': 'en',
        'locales.availableLanguages': ['en', 'de'],
      }
      return options[key]
    })
  })

  it('should return fallback language code', () => {
    getLanguageCode.mockReturnValue(null)

    expect(languageCode(null)).toEqual('en')
    expect(getLanguageCode).toBeCalledWith('')
    expect(config.get).toBeCalledWith('locales.availableLanguages')
    expect(config.get).toBeCalledWith('locales.defaultLangCode')
  })

  it('should return a default language code', () => {
    getLanguageCode.mockReturnValue('fr')

    expect(languageCode('fr')).toEqual('en')
    expect(getLanguageCode).toBeCalledWith('fr')
  })

  it('should return an available language code', () => {
    getLanguageCode.mockReturnValue('de')

    expect(languageCode('de')).toEqual('de')
    expect(getLanguageCode).toBeCalledWith('de')
  })
})
