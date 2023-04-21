const { serialize } = require('../../../services/serializers')

jest.mock('../../../services/serializers')

const serializers = require('./serializers')

describe('unit-type-rates serializers', () => {
  const data = 'data'
  const results = 'results'

  it('should serialize item params', async () => {
    serialize.mockReturnValue(results)

    expect(serializers.serialize(serializers.PERMITED_ITEM_PARAMS, data)).toEqual(results)

    expect(serialize).toBeCalledWith([
      'id',
      'propertyUnitTypeId',
      'rateId',
      'name',
      'currency',
      'cancellationPolicy',
      'pricesNightly',
      'discountEnabled',
      'discountType',
      'discountWeekly',
      'discountMonthly',
      'discountCustomEnabled',
      'discountCustom',
      'discountCustomPeriod',
      'minStayDays',
      'minStayWeekdayEnabled',
      'minStayWeekdayMo',
      'minStayWeekdayTu',
      'minStayWeekdayWe',
      'minStayWeekdayTh',
      'minStayWeekdayFr',
      'minStayWeekdaySa',
      'minStayWeekdaySu',
      'occupancyEnabled',
      'occupancyStartsAfterPerson',
      'occupancyExtraCharge',
      'shortStayEnabled',
      'shortStayDays',
      'shortStayExtraCharge',
      'selfServiceRestrictionsEnabled',
      'selfServiceCheckinMo',
      'selfServiceCheckinTu',
      'selfServiceCheckinWe',
      'selfServiceCheckinTh',
      'selfServiceCheckinFr',
      'selfServiceCheckinSa',
      'selfServiceCheckinSu',
      'selfServiceCheckoutMo',
      'selfServiceCheckoutTu',
      'selfServiceCheckoutWe',
      'selfServiceCheckoutTh',
      'selfServiceCheckoutFr',
      'selfServiceCheckoutSa',
      'selfServiceCheckoutSu',
      'taxEnabled',
      'taxIncluded',
      'taxPercentage',
      'notesEnabled',
      'notes',
      'createdAt',
      'updatedAt',
    ], data)
  })
})
