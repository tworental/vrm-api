const serializers = require('./serializers')

describe('storage stripe price serializers', () => {
  const price = {
    id: 'price_1HJe96BePlbI7ZoLDEhEvm3Q',
    object: 'price',
    active: true,
    billing_scheme: 'tiered',
    created: 1598269648,
    currency: 'eur',
    livemode: false,
    lookup_key: null,
    metadata: {
      version: 'v1',
    },
    nickname: null,
    product: {
      id: 'prod_HtR1pTOFWK1ije',
      object: 'product',
      active: true,
      attributes: [],
      created: 1598269640,
      description: 'The Enterprise service with extra features',
      images: [],
      livemode: false,
      metadata: {
        version: 'v1',
        packageId: '3',
      },
      name: 'Lodgly: Enterprise Service',
      statement_descriptor: null,
      type: 'service',
      unit_label: null,
      updated: 1598539600,
    },
    recurring: {
      aggregate_usage: null,
      interval: 'year',
      interval_count: 1,
      trial_period_days: null,
      usage_type: 'licensed',
    },
    tiers_mode: 'volume',
    transform_quantity: null,
    type: 'recurring',
    unit_amount: '20000',
    unit_amount_decimal: 20000,
  }

  it('should serialize a stripe price without tiers', () => {
    expect(serializers.serialize(price)).toEqual({
      id: 'price_1HJe96BePlbI7ZoLDEhEvm3Q',
      productId: 'prod_HtR1pTOFWK1ije',
      name: 'Lodgly: Enterprise Service',
      description: 'The Enterprise service with extra features',
      type: 'recurring',
      currency: 'eur',
      metadata: {
        version: 'v1',
        packageId: '3',
      },
      interval: 'year',
      intervalCount: 1,
      unitAmount: '20000',
    })
  })

  it('should serialize a stripe price with tires', () => {
    const payload = {
      ...price,
      tiers: [
        {
          flat_amount: null,
          flat_amount_decimal: null,
          unit_amount: 1600,
          unit_amount_decimal: '1600',
          up_to: null,
        },
      ],
    }

    expect(serializers.serialize(payload)).toEqual({
      id: 'price_1HJe96BePlbI7ZoLDEhEvm3Q',
      productId: 'prod_HtR1pTOFWK1ije',
      name: 'Lodgly: Enterprise Service',
      description: 'The Enterprise service with extra features',
      type: 'recurring',
      currency: 'eur',
      metadata: {
        version: 'v1',
        packageId: '3',
      },
      interval: 'year',
      intervalCount: 1,
      tiers: [
        {
          upTo: null,
          unitAmount: 1600,
        },
      ],
    })
  })
})
