const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { validate } = require('../../../../../services/validate')
const { translate } = require('../../../../../services/translate')
const { TRANSLATE_SCHEMA } = require('../../../../../models/v1/languages/schema')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../services/translate')

const httpHandler = require('./translate')

describe('POST /v1/app/languages/translate', () => {
  const text = 'text'
  const to = 'pl'

  const body = { text, to }

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should translate text', async () => {
    const data = 'results'

    const json = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue(body)
    translate.mockResolvedValue(data)

    await expect(httpHandler({ body }, { json }))
      .resolves.toEqual({ data })

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: TRANSLATE_SCHEMA })
    expect(translate).toBeCalledWith(text, to)
    expect(json).toBeCalledWith({ data })
  })

  it('should throw an error', async () => {
    const errorMessage = 'Error'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(body)
    translate.mockRejectedValue({ message: errorMessage })

    await expect(httpHandler({ body })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: TRANSLATE_SCHEMA })
    expect(translate).toBeCalledWith(text, to)
    expect(createError).toBeCalledWith(400, errorMessage)
  })

  it('should throw a validation error', async () => {
    const errorMessage = 'Validation Failed'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    validate.mockResolvedValue(body)
    translate.mockRejectedValue({
      message: errorMessage,
      errors: [{ reason: 'invalid' }],
    })

    await expect(httpHandler({ body })).rejects.toThrow(errorMessage)

    expect(validate).toBeCalledWith(body, { schema: TRANSLATE_SCHEMA })
    expect(translate).toBeCalledWith(text, to)
    expect(createError).toBeCalledWith(400, errorMessage, {
      code: 'VALIDATION_FAILED',
      errors: {
        to: ['invalid'],
      },
    })
  })
})
