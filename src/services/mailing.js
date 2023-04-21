const path = require('path')
const config = require('config')
const Email = require('email-templates')
const { createTransport } = require('nodemailer')

const { withErrorReporting } = require('./errorHandler')
const { SES } = require('./aws')
const { logInfo } = require('./logger')

const subjectPrefix = process.env.NODE_ENV !== 'production'
  ? `[${process.env.NODE_ENV.toUpperCase()}] `
  : false

const createInstance = () => {
  let client
  return (invalidate = false) => {
    if (client === undefined || invalidate) {
      client = new Email({
        message: {
          from: `${config.get('mailing.from.name')} <${config.get('mailing.from.email')}>`,
        },
        send: !config.get('mailing.sandbox'),
        preview: config.get('mailing.preview'),
        subjectPrefix,
        transport: createTransport({
          SES: new SES({
            region: config.get('aws.region'),
            accessKeyId: config.get('aws.accessKey'),
            secretAccessKey: config.get('aws.accessSecretKey'),
            signatureVersion: 'v4',
            apiVersion: '2010-12-01',
          }),
        }),
        i18n: {
          locales: config.get('locales.availableLanguages'),
          defaultLocale: config.get('locales.defaultLangCode'),
          directory: path.join(__dirname, '..', 'locales'),
        },
        views: {
          root: path.join(__dirname, '..', 'views', 'emails'),
          options: {
            extension: 'ejs',
          },
        },
      })
    }
    return client
  }
}

exports.getInstance = createInstance()

exports.sendMail = withErrorReporting((template, lang, to, variables = {}) => (
  exports.getInstance().send({
    template,
    message: { to },
    locals: {
      locale: lang || config.get('locales.defaultLangCode'),
      homePageUrl: config.get('mailing.content.homePageUrl'),
      companyInfo: config.get('mailing.content.companyInfo'),
      ...variables,
    },
  }).then(({ envelope, messageId }) => logInfo({ message: 'mail-sent', data: { envelope, messageId } }))
))
