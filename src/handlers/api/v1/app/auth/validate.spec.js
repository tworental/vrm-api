const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneWithAccount } = require('../../../../../models/v1/users/repositories')
const { selectOneBy: selectOrganizationBy } = require('../../../../../models/v1/accounts/repositories')
const { checkToken } = require('../../../../../models/v1/user-tokens/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/accounts/repositories')
jest.mock('../../../../../models/v1/user-tokens/repositories')

const httpHandler = require('./validate')

describe('POST /v1/app/auth/validate', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('organization validator', () => {
    const req = {
      body: {
        identifier: 'organization',
      },
      query: {
        field: 'organization',
      },
    }

    it('should validate an organization field', async () => {
      const statusCode = 204

      const sendStatus = jest.fn().mockImplementation((args) => args)

      selectOrganizationBy.mockResolvedValue('data')

      await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

      expect(handler).toBeCalled()
      expect(sendStatus).toBeCalledWith(statusCode)
      expect(selectOrganizationBy).toBeCalledWith({ identifier: 'organization' })
    })

    it('should throw an error when a organization could not be found', async () => {
      const errorMessage = 'Invalid Validation Key'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      selectOrganizationBy.mockResolvedValue(null)

      await expect(httpHandler(req)).rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(400, 'Validation Failed', {
        code: 'VALIDATION_FAILED',
        errors: { identifier: ['notExists'] },
      })
    })
  })

  describe('identifier validator', () => {
    const req = {
      body: {
        identifier: 'identifier',
      },
      query: {
        field: 'identifier',
      },
    }

    it('should validate an organization field', async () => {
      const statusCode = 204

      const sendStatus = jest.fn().mockImplementation((args) => args)

      selectOrganizationBy.mockResolvedValue(null)

      await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

      expect(sendStatus).toBeCalledWith(statusCode)
    })

    it('should throw an error when a organization is found', async () => {
      const errorMessage = 'Invalid Validation Key'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      selectOrganizationBy.mockResolvedValue('data')

      await expect(httpHandler(req)).rejects.toThrow(errorMessage)

      expect(selectOrganizationBy).toBeCalledWith({ identifier: 'identifier' })
      expect(createError).toBeCalledWith(400, 'Validation Failed', {
        code: 'VALIDATION_FAILED',
        errors: { identifier: ['exists'] },
      })
    })
  })

  describe('token validator', () => {
    const req = {
      body: {
        identifier: 'token',
        email: 'johndoe@domain.com',
        type: 'type',
        token: 'token',
      },
      query: {
        field: 'token',
      },
    }

    it('should validate an organization field', async () => {
      const statusCode = 204
      const user = {
        id: 1,
      }
      const userToken = 'user-token'

      const sendStatus = jest.fn().mockImplementation((args) => args)

      selectOneWithAccount.mockResolvedValue(user)
      checkToken.mockResolvedValue(userToken)

      await expect(httpHandler(req, { sendStatus })).resolves.toEqual(statusCode)

      expect(selectOneWithAccount).toBeCalledWith({ email: 'johndoe@domain.com', identifier: 'token' })
      expect(checkToken).toBeCalledWith(user.id, 'token', 'type')
      expect(sendStatus).toBeCalledWith(statusCode)
    })

    it('should throw an error when a organization is found', async () => {
      const errorMessage = 'Invalid Validation Key'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      selectOneWithAccount.mockResolvedValue(null)

      await expect(httpHandler(req)).rejects.toThrow(errorMessage)

      expect(createError).toBeCalledWith(400, 'Validation Failed', {
        code: 'VALIDATION_FAILED',
        errors: { token: ['invalid'] },
      })
    })

    it('should throw an error when a organization is found', async () => {
      const errorMessage = 'Invalid Validation Key'
      const user = {
        id: 1,
      }

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      selectOneWithAccount.mockResolvedValue(user)
      checkToken.mockResolvedValue(null)

      await expect(httpHandler(req)).rejects.toThrow(errorMessage)

      expect(selectOneWithAccount).toBeCalledWith({ email: 'johndoe@domain.com', identifier: 'token' })
      expect(createError).toBeCalledWith(400, 'Validation Failed', {
        code: 'VALIDATION_FAILED',
        errors: { token: ['invalid'] },
      })
    })
  })

  it('should throw an error when a validation rule does not exists', async () => {
    const errorMessage = 'Invalid Validation Key'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    await expect(httpHandler({ body: 'body', query: { field: 'wrong' } }))
      .rejects.toThrow(errorMessage)

    expect(createError).toBeCalledWith(422, 'Invalid Validation Key')
  })
})
