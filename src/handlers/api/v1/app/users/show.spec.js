const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy: selectUserBy } = require('../../../../../models/v1/users/repositories')
const { selectBy: selectPermissionsBy } = require('../../../../../models/v1/permissions/repositories')
const { serialize } = require('../../../../../models/v1/users/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/permissions/repositories')
jest.mock('../../../../../models/v1/users/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/users/:id', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const id = 1
    const accountId = 1000
    const user = { id, accountId }
    const results = { id: 1, name: 'user' }
    const data = 'data'
    const response = { data }
    const permissions = [{ id: 1, name: 'users', abilities: ['read'] }]

    const json = jest.fn().mockImplementation((args) => args)
    const where = jest.fn().mockResolvedValue(results)

    selectUserBy.mockReturnValue({ where })
    selectPermissionsBy.mockResolvedValue(permissions)
    serialize.mockResolvedValue(data)

    await expect(httpHandler({ user, params: { id } }, { json }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(where).toBeCalledWith('id', '!=', 1)
    expect(selectUserBy).toBeCalledWith({ accountId, id })
    expect(selectPermissionsBy).toBeCalledWith({ accountId, userId: id })
    expect(serialize).toBeCalledWith(results, {
      permissions: { users: ['read'] },
    })
    expect(json).toBeCalledWith(response)
  })

  it('should throw an error if user does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const where = jest.fn().mockResolvedValue(null)
    selectUserBy.mockReturnValue({ where })

    await expect(httpHandler({ user: { id: 1, accountId: 100 }, params: { id: 2 } }))
      .rejects.toThrow(errorMessage)

    expect(where).toBeCalledWith('id', '!=', 1)
    expect(selectUserBy).toBeCalledWith({ id: 2, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
