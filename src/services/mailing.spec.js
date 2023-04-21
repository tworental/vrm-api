const path = require('path')
const config = require('config')
const EmailTemplates = require('email-templates')
const { createTransport } = require('nodemailer')

const { withErrorReporting } = require('./errorHandler')
const { SES } = require('./aws')
const { logInfo } = require('./logger')

jest.mock('config')
jest.mock('email-templates')
jest.mock('nodemailer')
jest.mock('./errorHandler')
jest.mock('./aws')
jest.mock('./logger')

const mailingService = require('./mailing')

describe('mailing service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  describe('send email', () => {
    it('should publish email', async () => {
      const template = 'template'
      const locale = 'lang'
      const to = 'to'
      const variables = { key: 'value' }

      const envelope = 'envelope'
      const messageId = 'messageId'

      const send = jest.fn().mockResolvedValue({
        envelope, messageId,
      })

      config.get('mailing.content')

      jest.spyOn(mailingService, 'getInstance').mockReturnValue({
        send,
      })

      await expect(mailingService.sendMail(template, locale, to, variables))
        .resolves.toBeUndefined()

      expect(withErrorReporting).toBeCalled()
      expect(mailingService.getInstance).toBeCalled()
      expect(send).toBeCalledWith({
        template,
        message: { to },
        locals: {
          locale,
          homePageUrl: 'mailing.content.homePageUrl',
          companyInfo: 'mailing.content.companyInfo',
          ...variables,
        },
      })
      expect(config.get).not.toBeCalledWith('locales.defaultLangCode')
      expect(logInfo).toBeCalledWith({ message: 'mail-sent', data: { envelope, messageId } })
    })
  })

  describe('getInstance', () => {
    const client = {}

    beforeEach(() => {
      EmailTemplates.mockImplementation(() => client)
    })

    it('should get a new instance of Translate', () => {
      const transport = 'transport'
      const sesInstance = {}

      SES.mockImplementation(() => sesInstance)

      createTransport.mockReturnValue(transport)

      expect(mailingService.getInstance()).toEqual(client)

      expect(EmailTemplates).toBeCalledWith({
        message: {
          from: 'mailing.from.name <mailing.from.email>',
        },
        send: false,
        preview: 'mailing.preview',
        subjectPrefix: '[TEST] ',
        transport,
        i18n: {
          locales: 'locales.availableLanguages',
          defaultLocale: 'locales.defaultLangCode',
          directory: path.join(__dirname, '..', 'locales'),
        },
        views: {
          root: path.join(__dirname, '..', 'views', 'emails'),
          options: {
            extension: 'ejs',
          },
        },
      })
      expect(createTransport).toBeCalledWith({
        SES: sesInstance,
      })
      expect(SES).toBeCalledWith({
        region: 'aws.region',
        accessKeyId: 'aws.accessKey',
        secretAccessKey: 'aws.accessSecretKey',
        signatureVersion: 'v4',
        apiVersion: '2010-12-01',
      })
      expect(config.get).toHaveBeenNthCalledWith(1, 'mailing.from.name')
      expect(config.get).toHaveBeenNthCalledWith(2, 'mailing.from.email')
      expect(config.get).toHaveBeenNthCalledWith(3, 'mailing.sandbox')
      expect(config.get).toHaveBeenNthCalledWith(4, 'mailing.preview')
      expect(config.get).toHaveBeenNthCalledWith(5, 'aws.region')
      expect(config.get).toHaveBeenNthCalledWith(6, 'aws.accessKey')
      expect(config.get).toHaveBeenNthCalledWith(7, 'aws.accessSecretKey')
      expect(config.get).toHaveBeenNthCalledWith(8, 'locales.availableLanguages')
    })

    it('should get the same instance on subsequent calls', () => {
      expect(mailingService.getInstance(true)).toEqual(client)
      expect(mailingService.getInstance()).toEqual(client)

      expect(EmailTemplates).toBeCalledTimes(1)
    })
  })
})
