exports.TABLE_NAME = 'bookings'

exports.STATUSES = Object.freeze({
  DRAFT: 'draft',
  TENTATIVE: 'tentative',
  CONFIRMED: 'confirmed',
  CANCELED: 'canceled',
  DECLINED: 'declined',
})

exports.CANCELED_BY = Object.freeze({
  USER: 'user',
  OWNER: 'owner',
  GUEST: 'guest',
})

exports.LISTENERS = Object.freeze({
  STATUS_CHANGED: 'statusChanged',
})
