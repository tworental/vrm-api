const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { getSignedUrl } = require('../../../../../services/s3')
const {
  selectOneBy: selectOwnerBy,
} = require('../../../../../models/v1/owners/repositories')
const {
  selectWithPropertiesBy: selectUnitsBy,
} = require('../../../../../models/v1/units/repositories')
const { PERMITED_ITEM_PARAMS, serialize } = require('../../../../../models/v1/owners/serializers')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/s3')
jest.mock('../../../../../models/v1/owners/repositories')
jest.mock('../../../../../models/v1/units/repositories')
jest.mock('../../../../../models/v1/owners/serializers')

const httpHandler = require('./show')

describe('GET /v1/app/owners/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should show a resource', async () => {
    const accountId = 100

    const results = { data: { id } }
    const owner = {
      id: 100,
      avatar: 'avatar',
    }
    const units = [
      {
        id: 1,
        name: 'Unit 1',
        propertyName: 'Property 1',
        image: null,
      },
      {
        id: 2,
        name: 'Unit 2',
        propertyName: 'Property 1',
        image: null,
      },
    ]

    const json = jest.fn().mockImplementation((args) => args)

    selectOwnerBy.mockResolvedValue(owner)
    getSignedUrl.mockResolvedValue('s3avatar')
    selectUnitsBy.mockResolvedValue([
      {
        id: 1, ownerId: 100, name: 'Unit 1', propertyName: 'Property 1',
      },
      {
        id: 2, ownerId: 100, name: 'Unit 2', propertyName: 'Property 1',
      },
    ])

    serialize.mockReturnValue(results.data)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { json }))
      .resolves.toEqual(results)

    expect(handler).toBeCalled()
    expect(selectOwnerBy).toBeCalledWith({ id, accountId })
    expect(getSignedUrl).toBeCalledWith(owner.avatar)
    expect(selectUnitsBy).toBeCalledWith({ accountId, ownerId: owner.id })
    expect(serialize).toBeCalledWith(PERMITED_ITEM_PARAMS, owner, { avatar: 's3avatar', units })
    expect(json).toBeCalledWith(results)
  })

  it('should throw an error if owner does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOwnerBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOwnerBy).toBeCalledWith({ id, accountId: 100 })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
