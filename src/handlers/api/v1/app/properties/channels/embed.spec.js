const { handler } = require('../../../../../../services/http')
const { getIframeUrl, getProperty } = require('../../../../../../services/channex')
const { selectOneBy: selectPropertyBy } = require('../../../../../../models/v1/properties/repositories')

jest.mock('../../../../../../services/http')
jest.mock('../../../../../../services/channex')
jest.mock('../../../../../../models/v1/properties/repositories')

const httpHandler = require('./embed')

describe('GET /v1/app/properties/:propertyId/channels/:channelId/embed', () => {
  const propertyId = 1
  const accountId = 100

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should redirect to channex url', async () => {
    const results = 'url'
    const channexId = 'channexId'

    const redirect = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue({ channexId })
    getProperty.mockResolvedValue(null)
    getIframeUrl.mockResolvedValue(results)

    await expect(httpHandler({ params: { propertyId }, account: { id: accountId } }, { redirect }))
      .resolves.toBe(results)

    expect(handler).toBeCalled()
    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(redirect).toBeCalledWith(results)
    expect(getProperty).toBeCalledWith(channexId)
    expect(getIframeUrl).toBeCalledWith(channexId)
  })

  it('should send 422 status for not existed property', async () => {
    const results = 422

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue(null)

    await expect(httpHandler({ params: { propertyId }, account: { id: accountId } }, { sendStatus }))
      .resolves.toBe(results)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(sendStatus).toBeCalledWith(results)
  })

  it('should send 422 status for property without channexId', async () => {
    const results = 422

    const sendStatus = jest.fn().mockImplementation((args) => args)

    selectPropertyBy.mockResolvedValue({ channexId: null })

    await expect(httpHandler({ params: { propertyId }, account: { id: accountId } }, { sendStatus }))
      .resolves.toBe(results)

    expect(selectPropertyBy).toBeCalledWith({ id: propertyId, accountId })
    expect(sendStatus).toBeCalledWith(results)
  })
})
