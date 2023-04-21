const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('bookings serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'propertyId',
      'propertyUnitTypeId',
      'propertyUnitTypeUnitId',
      'propertyName',
      'propertyUnitTypeName',
      'propertyUnitTypeUnitName',
      'propertyUnitTypeUnitDeletedAt',
      'multipleUnitTypes',
      'dateArrival',
      'dateDeparture',
      'dateConfirmed',
      'dateCanceled',
      'optionExpirationDate',
      'checkinAt',
      'checkoutAt',
      'guestsAdults',
      'guestsInfants',
      'guestsChildren',
      'guestsTeens',
      'guestsInfants',
      'status',
      'canceledBy',
      'channelName',
      'channelCommission',
      'amountDiscount',
      'amountAccommodationDue',
      'amountSecureDeposited',
      'amountTotalPaid',
      'amountTotalTax',
      'amountTotal',
      'currency',
      'promoCode',
      'source',
      'notes',
      'guest',
      'createdAt',
      'updatedAt',
    ], data)
  })

  it('should serialize collection item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_COLLECTION_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'propertyId',
      'propertyUnitTypeId',
      'propertyUnitTypeUnitId',
      'propertyName',
      'propertyUnitTypeName',
      'propertyUnitTypeUnitName',
      'propertyUnitTypeUnitDeletedAt',
      'dateArrival',
      'dateDeparture',
      'checkinAt',
      'checkoutAt',
      'totalNights',
      'totalGuests',
      'guestsInfants',
      'guestName',
      'multipleUnitTypes',
      'status',
      'amountTotal',
      'currency',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ], data)
  })
})
