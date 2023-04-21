const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { selectOneBy, updateBy } = require('../../../../../models/v1/companies/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/companies/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/companies/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/companies:id', () => {
  const body = 'body'
  const accountId = 'accountId'
  const id = 'id'

  const payload = {
    name: 'name',
    accountId,
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockReturnValue(null)

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue('company')
    selectOneBy.mockReturnValue({ where })
    updateBy.mockResolvedValue()

    await expect(httpHandler({ body, user: { accountId }, params: { id } }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toHaveBeenNthCalledWith(1, { accountId, id })
    expect(selectOneBy).toHaveBeenNthCalledWith(2, { accountId, name: payload.name })
    expect(where).toBeCalledWith('id', '!=', id)
    expect(updateBy).toBeCalledWith({ id }, payload)
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should throw an error when company company does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ body, user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error when company name already exists', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockReturnValue('exist')

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValueOnce('company')
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
        name: ['exists'],
      },
    })
  })

  it('should update a resource when name is not present in payload', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({ accountId })
    selectOneBy.mockResolvedValue('company')
    updateBy.mockResolvedValue()

    await expect(httpHandler({ body, user: { accountId }, params: { id } }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(updateBy).toBeCalledWith({ id }, { accountId })
    expect(sendStatus).toBeCalledWith(statusCode)
  })
})
