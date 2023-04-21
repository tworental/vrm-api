const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const dayjs = require('../../../../../services/dayjs')
const { updateAvailability } = require('../../../../../services/channex')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/bookings/repositories')
const { selectOneBy: selectPropertyBy } = require('../../../../../models/v1/properties/repositories')
const { selectOneBy: selectUnitTypeBy } = require('../../../../../models/v1/unit-types/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../services/dayjs')
jest.mock('../../../../../services/channex')
jest.mock('../../../../../models/v1/bookings/repositories')
jest.mock('../../../../../models/v1/properties/repositories')
jest.mock('../../../../../models/v1/unit-types/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/bookings/:id', () => {
  const id = 1

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204
    const property = { channexId: 'channex' }
    const unitType = { channexId: 'channex' }

    const sendStatus = jest.fn().mockImplementation((args) => args)

    const whereIn = jest.fn().mockResolvedValue({ id, propertyId: 1, propertyUnitTypeId: 2 })
    const format = jest.fn().mockReturnValueOnce('date-from').mockReturnValueOnce('date-to')
    const utc = jest.fn().mockReturnValue({ format })

    deleteBy.mockResolvedValue()
    selectOneBy.mockReturnValue({ whereIn })

    selectPropertyBy.mockResolvedValue(property)
    selectUnitTypeBy.mockResolvedValue(unitType)
    dayjs.utc = utc

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(whereIn).toBeCalledWith('status', ['draft', 'tentative'])
    expect(deleteBy).toBeCalledWith({ id })
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(selectPropertyBy).toBeCalledWith({ id: 1 })
    expect(selectUnitTypeBy).toBeCalledWith({ id: 2 })
    expect(updateAvailability).toBeCalledWith([
      {
        propertyId: property.channexId,
        propertyUnitTypeId: unitType.channexId,
        dateFrom: 'date-from',
        dateTo: 'date-to',
        availability: 1,
      },
    ])
  })

  it('should throw an error if owner does not exists', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const whereIn = jest.fn().mockResolvedValue(null)

    selectOneBy.mockReturnValue({ whereIn })

    await expect(httpHandler({ user: { accountId: 100 }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId: 100 })
    expect(whereIn).toBeCalledWith('status', ['draft', 'tentative'])
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })
})
