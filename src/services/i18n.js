const path = require('path')
const config = require('config')
const { getLanguageCode } = require('locale-code')
const { I18n } = require('i18n')

exports.languageCode = (locale) => {
  const lang = getLanguageCode(locale || '')

  if (!config.get('locales.availableLanguages').includes(lang)) {
    return config.get('locales.defaultLangCode')
  }
  return lang
}

exports.i18n = (locale, { locales }) => {
  const i18n = new I18n({
    locales,
    directory: path.resolve(__dirname, '..', 'locales'),
    defaultLocale: locale,
  })

  // eslint-disable-next-line no-underscore-dangle
  return i18n.__
}
