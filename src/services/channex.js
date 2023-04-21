const config = require('config')

const { captureException } = require('./sentry')
const { CODES, MESSAGES } = require('./errorCodes')
const req = require('./request')
const { webhookUrl } = require('./frontend')
const createError = require('./errors')

const API_URL = config.get('channex.url')
const API_V1_URL = `${API_URL}/api/v1`
const API_KEY_HEADER_KEY = 'user-api-key'

const withApiKey = (fn) => (...args) => {
  try {
    const apiKey = config.get('channex.credentials.apiKey')

    return fn(apiKey, ...args)
  } catch (err) {
    captureException(err)
    throw new Error('Channex connection error')
  }
}

exports.oneTimeAccessToken = withApiKey((apiKey) => req.post(`${API_V1_URL}/auth/one_time_token`, null, {
  [API_KEY_HEADER_KEY]: apiKey,
}))

exports.getIframeUrl = (channexPropertyId) => exports
  .oneTimeAccessToken()
  .then(
    ({ data }) => `${API_URL}/auth/exchange?oauth_session_key=${data.token}&app_mode=headless&redirect_to=/channels&property_id=${channexPropertyId}`,
  )

exports.getHealthProperties = withApiKey((apiKey, id) => req.get(`${API_V1_URL}/properties/${id}/health`, {
  [API_KEY_HEADER_KEY]: apiKey,
}))

exports.upsert = async (endpoint, id, payload, headers) => {
  try {
    if (!id) {
      return await req.post(endpoint, payload, headers)
    }

    return await req.get(`${endpoint}/${id}`, headers).then(() => req.put(`${endpoint}/${id}`, payload, headers))
  } catch (err) {
    if (err.status === 404) {
      return req.post(endpoint, payload, headers)
    }
    throw err
  }
}

exports.getEntityById = async (endpoint, id, headers) => req.get(`${endpoint}/${id}`, headers)

/**
 * A Group inside Channex is a representation of TwoRentals accountId (single company/organization)
 */
exports.upsertGroup = withApiKey(async (apiKey, account) => {
  const ENDPOINT = `${API_V1_URL}/groups`

  const title = `[${account.id}] ${account.identifier}`
  const headers = { [API_KEY_HEADER_KEY]: apiKey }

  const group = await req
    .get(ENDPOINT, headers)
    .then(({ data }) => data.find(({ attributes }) => attributes.title === title))

  return exports.upsert(
    ENDPOINT,
    account.channexId || (group && group.id),
    {
      group: { title },
    },
    headers,
  )
})

exports.getProperty = withApiKey((apiKey, id) => req.get(`${API_V1_URL}/properties/${id}`, { [API_KEY_HEADER_KEY]: apiKey }))

exports.upsertProperty = withApiKey((apiKey, groupId, body) => exports.upsert(
  `${API_V1_URL}/properties`,
  body.id,
  {
    property: {
      title: body.name,
      currency: body.currency,
      email: body.email,
      phone: body.phoneNumber,
      zip_code: body.zipCode,
      country: body.countryIsoCode,
      state: body.stateProvince,
      city: body.city,
      address: [body.street1, body.street2].join(', '),
      longitude: body.lng,
      latitude: body.lat,
      timezone: body.timezone,
      facilities: body.facilities,
      group_id: groupId,
      settings: {
        allow_availability_autoupdate: true,
        min_price: null,
        max_price: null,
      },
      content: {
        description: body.description,
        photos: Array.isArray(body.photos)
          ? body.photos.map((photo) => ({
            url: photo.publicUrl,
            description: photo.description,
            position: photo.position,
            kind: 'photo',
          }))
          : [],
      },
    },
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.deleteProperty = withApiKey((apiKey, id) => req.delete(`${API_V1_URL}/properties/${id}`, { [API_KEY_HEADER_KEY]: apiKey }).catch((error) => {
  if (
    error.errors.details
      && error.errors.details.property
      && error.errors.details.property[0].includes('has channel')
  ) {
    // means that active channel exists
    throw createError(422, MESSAGES.ALREADY_EXISTS, { code: CODES.ALREADY_EXISTS })
  }

  if (error.errors.code === 'unauthorized') {
    captureException(`Channex Error: ${error.errors.code} ${error.errors.title}`)
  }

  if (error.errors.code !== 'resource_not_found') {
    throw error
  }
}))

exports.upsertRoomType = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/room_types`,
  body.id,
  {
    room_type: {
      property_id: body.propertyId,
      title: body.name,
      count_of_rooms: body.totalRooms,
      occ_adults: body.adults,
      occ_children: body.children,
      occ_infants: body.infants,
      default_occupancy: body.occupancy,
      facilities: body.facilities,
      kind: body.kind, // room, dorm
      capacity: null,
      content: {
        description: body.description,
        photos: Array.isArray(body.photos)
          ? body.photos.map((photo) => ({
            url: photo.publicUrl,
            description: photo.description,
            position: photo.position,
            kind: 'photo',
          }))
          : [],
      },
    },
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.upsertRatePlan = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/rate_plans`,
  body.id,
  {
    rate_plan: {
      title: body.name,
      property_id: body.propertyId,
      room_type_id: body.roomTypeId,
      currency: body.currency,
      parent_rate_plan_id: null,
      options: body.options,
      sell_mode: 'per_person', // per_room, per_person
      rate_mode: 'manual', // manual, derived, auto, cascade
    },
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.upsertRatePlanRestriction = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/restrictions`,
  body.id,
  {
    values: body.map((value) => ({
      property_id: value.propertyId,
      rate_plan_id: value.ratePlanId,
      date_from: value.startDate,
      date_to: value.endDate,
      rates: value.rates,
    })),
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.upsertSubscription = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/subscriptions`,
  body.id,
  {
    subscription: {
      property_id: body.propertyId,
      callback_url: webhookUrl('channex/bookings'),
      event_mask: 'booking',
      request_params: {},
      headers: {},
      is_active: true,
      send_data: true,
    },
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.upsertTax = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/taxes`,
  body.id,
  {
    tax: {
      title: body.name,
      logic: body.logic,
      type: 'tax',
      rate: Number(body.rate) * 100,
      is_inclusive: true,
      property_id: body.propertyId,
      currency: body.currency,
    },
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.upsertFee = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/taxes`,
  body.id,
  {
    tax: {
      title: body.name,
      logic: body.logic,
      type: 'fee',
      rate: Number(body.rate) * 100,
      is_inclusive: true,
      property_id: body.propertyId,
      currency: body.currency,
    },
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.updateAvailability = withApiKey((apiKey, body) => exports.upsert(
  `${API_V1_URL}/availability`,
  null,
  {
    values: body.map((item) => ({
      property_id: item.propertyId,
      room_type_id: item.propertyUnitTypeId,
      date_from: item.dateFrom,
      date_to: item.dateTo,
      date: item.date,
      availability: item.availability,
    })),
  },
  { [API_KEY_HEADER_KEY]: apiKey },
))

exports.getBooking = withApiKey((apiKey, body) => exports.getEntityById(`${API_V1_URL}/bookings`, body.id, {
  [API_KEY_HEADER_KEY]: apiKey,
}))
