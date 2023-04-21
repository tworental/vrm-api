const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const createError = require('../../../../../../services/errors')
const mailchimp = require('../../../../../../services/mailchimp')
const { MAILCHIMP_SCHEMA } = require('../../../../../../models/v1/integration-accounts/constants')

jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/mailchimp')

const httpHandler = require('./connect')

describe('POST /v1/app/integrations/mailchimp/connect', () => {
  it('should connect to mailchimp and return true', async () => {
    const body = { apiKey: 'apiKey', server: 'server' }

    const data = true

    validate.mockResolvedValue(body)

    mailchimp.connect.mockResolvedValue(true)

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ body }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: MAILCHIMP_SCHEMA })
    expect(mailchimp.connect).toBeCalledWith(body)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw not found error', async () => {
    const body = { apiKey: 'apiKey', server: 'server' }
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(body)

    mailchimp.connect.mockRejectedValue('error')

    await expect(httpHandler({ body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: MAILCHIMP_SCHEMA })
    expect(mailchimp.connect).toBeCalledWith(body)
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
