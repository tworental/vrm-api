exports.SCHEMA = {
  type: 'object',
  required: [
    'enabled',
    'priceNightly',
  ],
  properties: {
    id: {
      type: 'integer',
      minimum: 1,
    },
    enabled: {
      type: 'integer',
      enum: [0, 1],
    },
    priceNightly: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayMo: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayTu: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayWe: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayTh: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdayFr: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdaySa: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
    priceWeekdaySu: {
      type: 'number',
      nullable: true,
      minimum: 0,
    },
  },
}
