const { handler } = require('../../../../../services/http')
const { upload } = require('../../../../../services/s3')
const { sanitizePayload, createTransaction } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const { updateById: updateOwnerById, generateAvatarPath } = require('../../../../../models/v1/owners/repositories')
const { updateBy: updateOwnerSettingsBy } = require('../../../../../models/v1/owner-settings/repositories')
const { UPDATE_ME_SCHEMA } = require('../../../../../models/v1/owners/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/s3')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/owners/repositories')
jest.mock('../../../../../models/v1/owner-settings/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/owners/me', () => {
  const body = 'body'
  const accountId = 1
  const id = 100
  const response = 204
  const trx = 'transaction'
  const password = 'pa$$word'
  const firstName = 'John'
  const lastName = 'Doe'
  const phoneNumber = '+41777777777'
  const locale = 'en_US'
  const timezone = 'UTC'
  const parlance = ['en', 'de', 'pl']
  const language = 'en'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update details of logged in user including avatar', async () => {
    const files = {
      avatar: {
        name: 'name',
        data: 'data',
        size: 'size',
        mimetype: 'json',
      },
    }
    const buffer = 'data'
    const s3key = '1/uuid'

    const sendStatus = jest.fn().mockImplementation((args) => args)
    const bufferFrom = jest.spyOn(Buffer, 'from').mockImplementation((args) => args)

    createTransaction.mockImplementation((fn) => fn(trx))

    validate.mockResolvedValue({
      password, firstName, lastName, phoneNumber, locale, timezone, parlance, language,
    })

    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { id }, trx),
    )

    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { ownerId: id }, trx),
    )

    generateAvatarPath.mockReturnValue(s3key)
    upload.mockResolvedValue()
    updateOwnerById.mockResolvedValue()
    updateOwnerSettingsBy.mockResolvedValue()

    await expect(httpHandler({ files, body, user: { id, accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(handler).toBeCalled()
    expect(validate).toBeCalledWith(body, { schema: UPDATE_ME_SCHEMA })
    expect(generateAvatarPath).toBeCalledWith(accountId, id, files.avatar)
    expect(bufferFrom).toBeCalledWith(files.avatar.data, 'binary')
    expect(upload).toBeCalledWith(s3key, buffer, {
      ContentType: files.avatar.mimetype,
      Metadata: {
        'alt-name': encodeURIComponent(files.avatar.name),
      },
    })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(sanitizePayload).toBeCalledWith({
      password, firstName, lastName, phoneNumber, parlance, avatar: s3key,
    }, expect.any(Function))
    expect(updateOwnerById).toBeCalledWith({ id }, 'payload', trx)
    expect(sanitizePayload).toBeCalledWith({
      locale, timezone, language,
    }, expect.any(Function))
    expect(updateOwnerSettingsBy).toBeCalledWith({ ownerId: id }, 'payload', trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update details of logged in user not including any file', async () => {
    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({
      password, firstName, lastName, phoneNumber, locale, timezone, parlance, language,
    })
    createTransaction.mockImplementation((fn) => fn(trx))
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { id }, trx),
    )
    updateOwnerById.mockResolvedValue()
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { ownerId: id }, trx),
    )
    updateOwnerSettingsBy.mockResolvedValue()

    await expect(httpHandler({ files: {}, body, user: { id, accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_ME_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(sanitizePayload).toBeCalledWith({
      password, firstName, lastName, phoneNumber, parlance, avatar: undefined,
    }, expect.any(Function))
    expect(updateOwnerById).toBeCalledWith({ id }, 'payload', trx)
    expect(sanitizePayload).toBeCalledWith({
      locale, timezone, language,
    }, expect.any(Function))
    expect(updateOwnerSettingsBy).toBeCalledWith({ ownerId: id }, 'payload', trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update details of logged in user not including avatar', async () => {
    const files = 'files'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({
      password, firstName, lastName, phoneNumber, locale, timezone, parlance, language,
    })
    createTransaction.mockImplementation((fn) => fn(trx))
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { id }, trx),
    )
    updateOwnerById.mockResolvedValue()
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { ownerId: id }, trx),
    )
    updateOwnerSettingsBy.mockResolvedValue()

    await expect(httpHandler({ files, body, user: { id, accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_ME_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(sanitizePayload).toBeCalledWith({
      password, firstName, lastName, phoneNumber, parlance, avatar: undefined,
    }, expect.any(Function))
    expect(updateOwnerById).toBeCalledWith({ id }, 'payload', trx)
    expect(sanitizePayload).toBeCalledWith({
      locale, timezone, language,
    }, expect.any(Function))
    expect(updateOwnerSettingsBy).toBeCalledWith({ ownerId: id }, 'payload', trx)
    expect(sendStatus).toBeCalledWith(response)
  })
})
