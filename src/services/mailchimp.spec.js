const mailchimp = require('@mailchimp/mailchimp_marketing')
const createError = require('./errors')

jest.mock('@mailchimp/mailchimp_marketing')
jest.mock('./errors')

const service = require('./mailchimp')

describe('mailchimp service', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('getInstance', () => {
    it('should set config and return object', () => {
      const apiKey = 'apiKey'

      mailchimp.setConfig = jest.fn()

      expect(service.getInstance({ apiKey })).toBeDefined()
      expect(mailchimp.setConfig).toBeCalledWith({ apiKey, server: 'us1' })
    })
  })

  describe('connect', () => {
    it('should check ping connection', () => {
      const settings = 'settings'
      const pingSpy = jest.fn().mockReturnValue('pong')

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        ping: { get: pingSpy },
      })

      expect(service.connect(settings)).toBe('pong')
      expect(instanceSpy).toBeCalledWith(settings)
      expect(pingSpy).toBeCalled()
    })
  })

  describe('getLists', () => {
    it('should return lists', () => {
      const settings = 'settings'
      const lists = [
        { id: 1, name: 'list-1' },
        { id: 2, name: 'list-2' },
        { id: 3, name: 'list-3' },
      ]
      const getAllListsSpy = jest.fn().mockReturnValue(lists)

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        lists: { getAllLists: getAllListsSpy },
      })

      expect(service.getLists(settings)).toEqual(lists)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getAllListsSpy).toBeCalled()
    })
  })

  describe('getList', () => {
    it('should return first list from all lists', async () => {
      const settings = { listId: undefined }
      const lists = [
        { id: 1, name: 'list-1' },
        { id: 2, name: 'list-2' },
        { id: 3, name: 'list-3' },
      ]
      const getAllListsSpy = jest.fn().mockResolvedValue({ lists })

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        lists: { getAllLists: getAllListsSpy },
      })

      await expect(service.getList(settings)).resolves.toEqual(lists[0])
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getAllListsSpy).toBeCalled()
    })

    it('should return list by id', async () => {
      const settings = { listId: 1 }
      const list = { id: 1, name: 'list-1' }
      const getListSpy = jest.fn().mockResolvedValue(list)

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        lists: { getList: getListSpy },
      })

      await expect(service.getList(settings)).resolves.toEqual(list)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings.listId)
    })
  })

  describe('createListMember', () => {
    it('should throw NOT_FOUND error if list does not exist', async () => {
      const settings = { listId: undefined }
      const details = { firstName: 'firstName', lastName: 'lastName', phoneNumber: 'phoneNumber' }
      const errorMessage = 'Not Found'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const instanceSpy = jest.spyOn(service, 'getInstance')
      const getListSpy = jest.spyOn(service, 'getList').mockResolvedValue(null)

      await expect(service.createListMember(settings, details))
        .rejects.toThrow(errorMessage)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings)
      expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    })

    it('should create a member', async () => {
      const settings = { listId: 'list-id' }
      const details = { firstName: 'firstName', lastName: 'lastName', phoneNumber: 'phoneNumber' }

      const addListMemberSpy = jest.fn().mockResolvedValue(details)

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        lists: { addListMember: addListMemberSpy },
      })
      const getListSpy = jest.spyOn(service, 'getList').mockResolvedValue({ id: 'list-id' })

      await expect(service.createListMember(settings, details))
        .resolves.toEqual(details)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings)
      expect(addListMemberSpy).toBeCalledWith(settings.listId, {
        email_address: details.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: details.firstName,
          LNAME: details.lastName,
          PHONE: details.phoneNumber,
        },
      })
    })
  })

  describe('updateListMember', () => {
    it('should throw NOT_FOUND error if list does not exist', async () => {
      const settings = { listId: undefined }
      const details = {
        mailchimpId: 1,
        firstName: 'firstName',
        lastName: 'lastName',
        phoneNumber: 'phoneNumber',
      }
      const errorMessage = 'Not Found'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const instanceSpy = jest.spyOn(service, 'getInstance')
      const getListSpy = jest.spyOn(service, 'getList').mockResolvedValue(null)

      await expect(service.updateListMember(settings, details))
        .rejects.toThrow(errorMessage)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings)
      expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    })

    it('should update a member', async () => {
      const settings = { listId: 'list-id' }
      const details = {
        mailchimpId: 1,
        firstName: 'firstName',
        lastName: 'lastName',
        phoneNumber: 'phoneNumber',
      }

      const updateListMemberSpy = jest.fn().mockResolvedValue(details)

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        lists: { updateListMember: updateListMemberSpy },
      })
      const getListSpy = jest.spyOn(service, 'getList').mockResolvedValue({ id: 'list-id' })

      await expect(service.updateListMember(settings, details))
        .resolves.toEqual(details)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings)
      expect(updateListMemberSpy).toBeCalledWith(settings.listId, details.mailchimpId, {
        email_address: details.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: details.firstName,
          LNAME: details.lastName,
          PHONE: details.phoneNumber,
        },
      })
    })
  })

  describe('deleteListMember', () => {
    it('should throw NOT_FOUND error if list does not exist', async () => {
      const settings = { listId: undefined }
      const mailchimpId = 1
      const errorMessage = 'Not Found'

      createError.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      const instanceSpy = jest.spyOn(service, 'getInstance')
      const getListSpy = jest.spyOn(service, 'getList').mockResolvedValue(null)

      await expect(service.deleteListMember(settings, mailchimpId))
        .rejects.toThrow(errorMessage)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings)
      expect(createError).toBeCalledWith(404, errorMessage, { code: 'NOT_FOUND' })
    })

    it('should delete a member', async () => {
      const settings = { listId: 'list-id' }
      const mailchimpId = 1

      const deleteListMemberSpy = jest.fn().mockResolvedValue(mailchimpId)

      const instanceSpy = jest.spyOn(service, 'getInstance').mockReturnValue({
        lists: { deleteListMember: deleteListMemberSpy },
      })
      const getListSpy = jest.spyOn(service, 'getList').mockResolvedValue({ id: 'list-id' })

      await expect(service.deleteListMember(settings, mailchimpId))
        .resolves.toEqual(mailchimpId)
      expect(instanceSpy).toBeCalledWith(settings)
      expect(getListSpy).toBeCalledWith(settings)
      expect(deleteListMemberSpy).toBeCalledWith(settings.listId, mailchimpId)
    })
  })
})
