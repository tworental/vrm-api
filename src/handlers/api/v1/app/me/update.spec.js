const { handler } = require('../../../../../services/http')
const { upload } = require('../../../../../services/s3')
const { sanitizePayload, createTransaction } = require('../../../../../services/database')
const { validate } = require('../../../../../services/validate')
const { updateBy: updateUserBy, generateAvatarPath } = require('../../../../../models/v1/users/repositories')
const { updateBy: updateUserSettingsBy } = require('../../../../../models/v1/user-settings/repositories')
const { UPDATE_ME_SCHEMA } = require('../../../../../models/v1/users/schema')

jest.mock('../../../../../services/http')
jest.mock('../../../../../services/s3')
jest.mock('../../../../../services/database')
jest.mock('../../../../../services/validate')
jest.mock('../../../../../models/v1/users/repositories')
jest.mock('../../../../../models/v1/user-settings/repositories')

const httpHandler = require('./update')

describe('PATCH /v1/app/me', () => {
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
  const language = 'en'

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  it('should update a resource', async () => {
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
      password, firstName, lastName, phoneNumber, locale, timezone, language,
    })

    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { id }, trx),
    )

    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { userId: id }, trx),
    )

    generateAvatarPath.mockReturnValue(s3key)
    upload.mockResolvedValue()
    updateUserBy.mockResolvedValue()
    updateUserSettingsBy.mockResolvedValue()

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
      password, firstName, lastName, phoneNumber, avatar: s3key,
    }, expect.any(Function))
    expect(updateUserBy).toBeCalledWith({ id, accountId }, 'payload', trx)
    expect(sanitizePayload).toBeCalledWith({
      locale, timezone, language,
    }, expect.any(Function))
    expect(updateUserSettingsBy).toBeCalledWith({ userId: id }, 'payload', trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update a resource', async () => {
    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({
      password, firstName, lastName, phoneNumber, locale, timezone, language,
    })
    createTransaction.mockImplementation((fn) => fn(trx))
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { id }, trx),
    )
    updateUserBy.mockResolvedValue()
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { userId: id }, trx),
    )
    updateUserSettingsBy.mockResolvedValue()

    await expect(httpHandler({ files: {}, body, user: { id, accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_ME_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(sanitizePayload).toBeCalledWith({
      password, firstName, lastName, phoneNumber, avatar: undefined,
    }, expect.any(Function))
    expect(updateUserBy).toBeCalledWith({ id, accountId }, 'payload', trx)
    expect(sanitizePayload).toBeCalledWith({
      locale, timezone, language,
    }, expect.any(Function))
    expect(updateUserSettingsBy).toBeCalledWith({ userId: id }, 'payload', trx)
    expect(sendStatus).toBeCalledWith(response)
  })

  it('should update a resource', async () => {
    const files = 'files'

    const sendStatus = jest.fn().mockImplementation((args) => args)

    validate.mockResolvedValue({
      password, firstName, lastName, phoneNumber, locale, timezone, language,
    })
    createTransaction.mockImplementation((fn) => fn(trx))
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { id }, trx),
    )
    updateUserBy.mockResolvedValue()
    sanitizePayload.mockImplementationOnce(
      (payload, callback) => callback('payload', { userId: id }, trx),
    )
    updateUserSettingsBy.mockResolvedValue()

    await expect(httpHandler({ files, body, user: { id, accountId } }, { sendStatus }))
      .resolves.toEqual(response)

    expect(validate).toBeCalledWith(body, { schema: UPDATE_ME_SCHEMA })
    expect(createTransaction).toBeCalledWith(expect.any(Function))
    expect(sanitizePayload).toBeCalledWith({
      password, firstName, lastName, phoneNumber, avatar: undefined,
    }, expect.any(Function))
    expect(updateUserBy).toBeCalledWith({ id, accountId }, 'payload', trx)
    expect(sanitizePayload).toBeCalledWith({
      locale, timezone, language,
    }, expect.any(Function))
    expect(updateUserSettingsBy).toBeCalledWith({ userId: id }, 'payload', trx)
    expect(sendStatus).toBeCalledWith(response)
  })
})
