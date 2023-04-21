const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { updateBy, selectOneBy } = require('../../../../../models/v1/taxes/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/taxes/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/taxes/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/taxes/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200

    const tax = { id }
    const payload = {
      dictFeeId: 1,
      key: 'value',
    }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue(tax)
    updateBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { id }, body }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(updateBy).toBeCalledWith({ id: tax.id }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue({})
    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
