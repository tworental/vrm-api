const createError = require('../../../../../services/errors')
const { handler } = require('../../../../../services/http')
const { selectOneBy, deleteBy } = require('../../../../../models/v1/guests/repositories')
const { selectOneBy: selectBookingGuestBy } = require('../../../../../models/v1/booking-guests/repositories')
const { deleteMailchimpGuest } = require('../../../../../models/v1/integration-accounts/repositories')

jest.mock('../../../../../services/errors')
jest.mock('../../../../../services/http')
jest.mock('../../../../../models/v1/guests/repositories')
jest.mock('../../../../../models/v1/booking-guests/repositories')
jest.mock('../../../../../models/v1/integration-accounts/repositories')

const httpHandler = require('./delete')

describe('DELETE /v1/app/guests/:id', () => {
  const id = 1
  const accountId = 100

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should delete a resource', async () => {
    const statusCode = 204

    const sendStatus = jest.fn().mockImplementation((args) => args)

    deleteBy.mockResolvedValue()
    selectOneBy.mockResolvedValue({ id })

    await expect(httpHandler({ user: { accountId }, params: { id } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(handler).toBeCalled()
    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(deleteBy).toBeCalledWith({ id })
    expect(sendStatus).toBeCalledWith(statusCode)
  })

  it('should delete a resource from mailchimp', async () => {
    const statusCode = 204
    const mailchimpId = 'mailchimpId'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    deleteBy.mockResolvedValue()
    selectOneBy.mockResolvedValue({ id, mailchimpId })
    const mailchimpFn = jest.fn()
    deleteMailchimpGuest.mockImplementation(() => mailchimpFn)

    await expect(httpHandler({ user: { accountId }, params: { id } }, { sendStatus }))
      .resolves.toBe(statusCode)

    expect(selectOneBy).toBeCalledWith({ accountId, id })
    expect(deleteBy).toBeCalledWith({ id })
    expect(sendStatus).toBeCalledWith(statusCode)
    expect(deleteMailchimpGuest).toBeCalledWith(accountId)
    expect(mailchimpFn).toBeCalledWith(mailchimpId)
  })

  it('should throw an error if guest does not exist', async () => {
    const errorMessage = 'Not Found'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue(null)

    await expect(httpHandler({ user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
  })

  it('should throw an error if any booking exists', async () => {
    const errorMessage = 'Booking Attached'

    createError.mockImplementation(() => {
      throw new Error(errorMessage)
    })

    selectOneBy.mockResolvedValue({ id })
    selectBookingGuestBy.mockResolvedValue('booking')

    await expect(httpHandler({ user: { accountId }, params: { id } }))
      .rejects.toThrow(errorMessage)

    expect(selectOneBy).toBeCalledWith({ id, accountId })
    expect(selectBookingGuestBy).toBeCalledWith({ guestId: id })
    expect(createError).toBeCalledWith(422, errorMessage, { code: 'BOOKINGS_ATTACHED' })
  })
})
