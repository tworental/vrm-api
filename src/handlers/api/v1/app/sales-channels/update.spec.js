const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { updateBy, selectOneBy } = require('../../../../../models/v1/sales-channels/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/sales-channels/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/sales-channels/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/sales-channels/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'

  const payload = {
    name: 'value',
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200

    const sendStatus = jest.fn().mockImplementation((args) => args)

    const where = jest.fn().mockReturnValue()

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValueOnce({ id })
    selectOneBy.mockReturnValue({ where })
    updateBy.mockResolvedValue()

    await expect(httpHandler({ user: { accountId }, params: { id }, body }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(selectOneBy).toBeCalledWith({ accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(updateBy).toBeCalledWith({ id }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when name already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockReturnValue('exist')

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValueOnce('saleChannel')
    selectOneBy.mockReturnValue({ where })

    await expect(httpHandler({ body, user: { accountId }, params: { id } })).rejects
      .toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(updateBy).not.toBeCalled()
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        name: ['unique'],
      },
    })
  })

  it('should throw an error when resource does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }))
      .rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
