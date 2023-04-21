const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const {
  updateBy,
  selectOneBy,
  isCompleted,
} = require('../../../../../models/v1/rate-seasons/repositories')
const { UPDATE_SCHEMA } = require('../../../../../models/v1/rate-seasons/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/rate-seasons/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/rate-seasons/:id', () => {
  const accountId = 'accountId'
  const id = 'id'
  const body = 'body'

  const payload = {
    key: 'value',
  }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
    const statusCode = 200

    const rate = { id }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(payload)
    selectOneBy.mockResolvedValue(rate)
    updateBy.mockResolvedValue()
    isCompleted.mockReturnValue(true)

    await expect(httpHandler({ user: { accountId }, params: { id }, body }, { sendStatus }))
      .resolves.toEqual(statusCode)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_SCHEMA })
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(updateBy).toBeCalledWith({ id: rate.id }, { ...payload, isCompleted: true })
    expect(isCompleted).toBeCalledWith({ ...rate, ...payload })
    expect(sendStatus).toBeCalledWith(statusCode)
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
