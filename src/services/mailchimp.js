const mailchimp = require('@mailchimp/mailchimp_marketing')
const createError = require('./errors')
const { CODES, MESSAGES } = require('./errorCodes')

const DEFAULT_SERVER = 'us1'

exports.getInstance = ({ apiKey, server = DEFAULT_SERVER }) => {
  mailchimp.setConfig({ apiKey, server })
  return mailchimp
}

exports.connect = (settings) => {
  const client = exports.getInstance(settings)

  return client.ping.get()
}

exports.getLists = (settings) => {
  const client = exports.getInstance(settings)

  return client.lists.getAllLists()
}

exports.getList = (settings) => {
  const { listId } = settings

  const client = exports.getInstance(settings)

  if (listId) {
    return client.lists.getList(listId)
  }

  return client.lists.getAllLists()
    .then(({ lists }) => lists[0])
}

exports.createListMember = async (settings, details) => {
  const client = exports.getInstance(settings)
  const list = await exports.getList(settings)

  if (list) {
    return client.lists.addListMember(list.id, {
      email_address: details.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: details.firstName,
        LNAME: details.lastName,
        PHONE: details.phoneNumber,
      },
    })
  }

  throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
}

exports.updateListMember = async (settings, details) => {
  const client = exports.getInstance(settings)
  const list = await exports.getList(settings)

  if (list) {
    return client.lists.updateListMember(list.id, details.mailchimpId, {
      email_address: details.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: details.firstName,
        LNAME: details.lastName,
        PHONE: details.phoneNumber,
      },
    })
  }

  throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
}

exports.deleteListMember = async (settings, mailchimpId) => {
  const client = exports.getInstance(settings)
  const list = await exports.getList(settings)

  if (list) {
    return client.lists.deleteListMember(list.id, mailchimpId)
  }

  throw createError(404, MESSAGES.NOT_FOUND, { code: CODES.NOT_FOUND })
}
