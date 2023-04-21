const createError = require('../../../../../../../services/errors')
const { handler } = require('../../../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../../../models/v1/unit-type-rate-seasons/repositories')

jest.mock('../../../../../../../services/errors')
jest.mock('../../../../../../../services/http')
jest.mock('../../../../../../../models/v1/unit-type-rate-seasons/repositories')

const httpHandler = require('./delete')

describe('DELETE v1/app/properties/unit-types/season-rates', () => {
  const accountId = 'accountId'
  const propertyUnitTypeId = 'propertyUnitTypeId'
  const id = 'id'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete an resource', async () => {
    const status = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectOneBy.mockResolvedValue('seasonRates')
    deleteBy.mockResolvedValue()

    await expect(httpHandler({
      user: { accountId },
      params: { propertyUnitTypeId, id },
    }, { sendStatus })).resolves.toEqual(status)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId, propertyUnitTypeId })
    expect(deleteBy).toBeCalledWith({ id, accountId, propertyUnitTypeId })
    expect(sendStatus).toBeCalledWith(status)
  })

  it('should throw an error when season rate does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({
      user: { accountId },
      params: { propertyUnitTypeId, id },
    })).rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId, propertyUnitTypeId })
    expect(createError).toBeCalledWith(404, errorMessage, {
      code: 'NOT_FOUND',
    })
  })
})
