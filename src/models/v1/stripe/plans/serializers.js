const unitAmounts = (price) => {
  if (price.tiers) {
    return {
      tiers: price.tiers.map((tier) => ({
        upTo: tier.up_to,
        unitAmount: tier.unit_amount,
      })),
    }
  }
  return { unitAmount: price.unit_amount }
}

exports.serialize = (price) => ({
  id: price.id,
  productId: price.product.id,
  name: price.product.name,
  description: price.product.description,
  type: price.type,
  currency: price.currency,
  metadata: price.product.metadata,
  interval: price.recurring.interval,
  intervalCount: price.recurring.interval_count,
  ...unitAmounts(price),
})
