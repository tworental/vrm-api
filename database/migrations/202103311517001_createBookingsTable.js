const {
  TABLE_NAME, STATUSES, CANCELED_BY,
} = require('../../src/models/v1/bookings/constants')

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (table) => {
  table.increments().unsigned().primary()
  table.integer('account_id').unsigned().notNull()
  table.integer('property_id').notNull().unsigned()
  table.integer('property_unit_type_id').notNull().unsigned()
  table.integer('property_unit_type_unit_id').notNull().unsigned()
  table.string('channex_id', 120).index()
  table.string('channex_revision_id', 120).index()

  table.datetime('date_arrival').notNull()
  table.datetime('date_departure').notNull()

  table.datetime('date_confirmed')
  table.datetime('date_canceled')

  table.datetime('checkin_at')
  table.datetime('checkout_at')

  table.datetime('option_expiration_date')

  table.integer('guests_adults').defaultTo(2).notNull()
  table.integer('guests_children').defaultTo(0)
  table.integer('guests_teens').defaultTo(0)
  table.integer('guests_infants').defaultTo(0)

  table.enum('status', Object.values(STATUSES)).notNull().defaultTo(STATUSES.DRAFT)
  table.enum('canceled_by', Object.values(CANCELED_BY))

  table.string('channel_name')
  table.decimal('channel_commission', 5, 2)

  table.decimal('unit_type_tax_rate', 5, 2)
  table.boolean('unit_type_tax_included').defaultTo(null)

  table.decimal('amount_discount', 10, 2)
  table.decimal('amount_accommodation_due', 10, 2)
  table.decimal('amount_secure_deposited', 10, 2)
  table.decimal('amount_total_paid', 10, 2)
  table.decimal('amount_total_tax', 10, 2)
  table.decimal('amount_total', 10, 2)
  table.string('currency', 3)
  table.string('promo_code', 40)

  table.boolean('is_paid').defaultTo(0)

  table.string('source')
  table.text('notes')

  table.string('ota_name')
  table.string('ota_reservation_code')

  table.timestamp('archived_at')
  table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'))
  table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

  table.foreign('account_id').references('accounts.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_id').references('properties.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_unit_type_id').references('property_unit_types.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')

  table.foreign('property_unit_type_unit_id').references('property_unit_type_units.id')
    .onUpdate('CASCADE')
    .onDelete('CASCADE')
})

exports.down = (knex) => knex.schema.dropTable(TABLE_NAME)

/*
{
  "success": true,
  "data": {
    "requestedUid": "B2676257",
    "booking": {
      "uid": "B2676257",
      "type": "Booking",
      "id": 2676257,
      "dateCreated": "2020-11-11",
      "fullDateCreated": "2020-11-11T16:58:23+00:00",
      "dateArrival": "2020-12-09",
      "dateDeparture": "2020-12-26",
      "generalStatus": "Open",
      "allowedGeneralStatuses": [
        "SetAsTentative",
        "Send",
        "Deactivate"
      ],
      "allowedStatuses": [
        "SetAsTentative"
      ],
      "allowedActions": [
        "EditNotes",
        "EditBooking",
        "EditSource",
        "EditGuest",
        "AddNewQuote"
      ],
      "currencyCode": "USD",
      "totalUnreadMessages": 0,
      "propertyId": 305432,
      "propertyName": "Radisson Blu",
      "propertyImageUrl": "https://l.icdbcdn.com/oh/b1564280-d99a-4357-a1e7-cd553aaa2b19.jpg?f=32",
      "status": "Open",
      "roomTypes": [
        {
          "id": 2761166,
          "roomTypeId": 370274,
          "imageUrl": null,
          "name": "",
          "people": 2
        }
      ],
      "addOns": [],
      "source": "Manual",
      "sourceText": "AAAAAA",
      "notes": null,
      "language": "en",
      "ipAddress": null,
      "ipCountry": null,
      "isDeleted": false,
      "websiteId": 305907,
      "bookability": "InstantBooking",
      "isPolicyActive": true,
      "amountPaid": 0,
      "amountOverdue": 0,
      "amountDue": 1944,
      "totalTransactions": 0,
      "changeRequestId": null,
      "promotionCode": null,
      "externalUrl": null,
      "externalTotal": 0,
      "nights": 17
    },
    "guest": {
      "uid": "8bjv6ARy5USLQtFEidxwcg",
      "name": "asasas assasaas",
      "email": null,
      "phoneNumber": null,
      "country": null,
      "countryCode": null,
      "paymentMethod": null
    },
    "archivedOrders": [],
    "transactions": [],
    "currentOrder": {
      "id": 1127289,
      "dateArrival": "2020-12-09",
      "dateDeparture": "2020-12-26",
      "nights": 17,
      "propertyId": 305432,
      "propertyName": "Radisson Blu",
      "currencyCode": "USD",
      "status": "NotSent",
      "isReadOnly": false,
      "allowedStatuses": [
        "Send",
        "Deactivate"
      ],
      "applicableRejectedReasons": [],
      "amountGross": 1944,
      "amountNet": 1907.93,
      "dateCancelled": null,
      "amountCancelled": null,
      "amountToCollect": 1944,
      "roomTypeItems": [
        {
          "roomTypeId": 370274,
          "description": "RoomType",
          "subtotal": 1944,
          "prices": [
            {
              "type": "RoomRate",
              "feeType": null,
              "amount": 1922,
              "vatAmount": 0,
              "netAmount": 1922,
              "grossAmount": 1922,
              "description": "Room Rate"
            },
            {
              "type": "Promotion",
              "feeType": null,
              "amount": -200,
              "vatAmount": 0,
              "netAmount": -200,
              "grossAmount": -200,
              "description": "Promotion"
            },
            {
              "type": "Fee",
              "feeType": "Miscellaneous",
              "amount": 200,
              "vatAmount": 36.07,
              "netAmount": 163.93,
              "grossAmount": 200,
              "description": "Extra Fee"
            },
            {
              "type": "Tax",
              "feeType": null,
              "amount": 22,
              "vatAmount": 0,
              "netAmount": 22,
              "grossAmount": 22,
              "description": "tax 1"
            }
          ]
        }
      ],
      "addOnItems": [],
      "otherItems": [],
      "totalVat": null,
      "totalExcludingVat": null,
      "totalIncludingVat": {
        "type": "Other",
        "feeType": null,
        "amount": 36.07,
        "vatAmount": null,
        "netAmount": 0,
        "grossAmount": 0,
        "description": "incl. Sales Tax of 36.07"
      },
      "scheduledPayments": [
        {
          "id": 1015690,
          "dateDue": null,
          "dateRequested": null,
          "requested": false,
          "status": "Scheduled",
          "processingStatus": "NotProcessed",
          "amount": 972,
          "refundTransactionId": null,
          "allowedActions": [],
          "schedulerType": "None"
        },
        {
          "id": 1015691,
          "dateDue": "2020-12-10",
          "dateRequested": null,
          "requested": false,
          "status": "Scheduled",
          "processingStatus": "NotProcessed",
          "amount": 972,
          "refundTransactionId": null,
          "allowedActions": [],
          "schedulerType": "None"
        }
      ],
      "cancellationRefunds": [],
      "securityDepositPayments": [],
      "totalScheduled": 1944,
      "totalScheduledRefunds": 0,
      "totalManual": 0,
      "dateAgreed": null,
      "securityDepositText": "A refundable damage deposit of USD 200.00 is due.",
      "securityDepositAmount": 200,
      "cancellationPolicyText": "100% of paid prepayments refundable when cancelled 0
      \r\n days before arrival or earlier.\r\n0% refundable if cancelled after.",
      "scheduledPolicyText": "50% due at time of booking.\r\nRemaining balance due 1 days after arrival.\r\n",
      "ownerPayout": null,
      "isPolicyActive": true,
      "ratePolicyName": "xxx",
      "expirationHours": 48,
      "expirationDate": null,
      "rentalAgreement": "3a532061-5b01-46ff-8497-a2078fb21888",
      "rentalAgreementAccepted": false,
      "rentalAgreementEmpty": true,
      "rentalAgreementUrl": "",
      "damageProtection": null
    },
    "paymentRequest": null,
    "subOwner": {
      "userId": 406663,
      "firstName": "john",
      "lastName": "doe",
      "email": "mits.87@gmail.com",
      "phone": null
    },
    "externalQuote": null,
    "notification": {
      "lastTransactionStatus": null
    },
    "damageProtection": null
  },
  "warnings": []
}
*/
