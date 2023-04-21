const { handler } = require('../../../../../../services/http')
const { validate } = require('../../../../../../services/validate')
const createError = require('../../../../../../services/errors')
const mailchimp = require('../../../../../../services/mailchimp')
const { MAILCHIMP_SCHEMA } = require('../../../../../../models/v1/integration-accounts/constants')

jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/validate')
jest.mock('../../../../../../services/errors')
jest.mock('../../../../../../services/mailchimp')

const httpHandler = require('./lists')

describe('GET /v1/app/integrations/mailchimp/lists', () => {
  it('should display all resources', async () => {
    const query = { apiKey: 'apiKey', server: 'server' }

    const data = [
      {
        id: 1,
        name: 'List 1',
      },
      {
        id: 2,
        name: 'List 2',
      },
    ]

    validate.mockResolvedValue(query)

    mailchimp.getLists.mockResolvedValue({ lists: data })

    const json = jest.fn().mockImplementation((args) => args)

    await expect(httpHandler({ query }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(query, { schema: MAILCHIMP_SCHEMA })
    expect(mailchimp.getLists).toBeCalledWith(query)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw not found error', async () => {
    const query = { apiKey: 'apiKey', server: 'server' }
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(query)

    mailchimp.getLists.mockRejectedValue('error')

    await expect(httpHandler({ query }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(query, { schema: MAILCHIMP_SCHEMA })
    expect(mailchimp.getLists).toBeCalledWith(query)
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
