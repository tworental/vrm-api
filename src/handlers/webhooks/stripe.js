/* eslint-disable no-console */
const cache = require('../../services/cacheManager')
const { SUBSCRIPTION_STATUS } = require('../../models/v1/billing/subscriptions/constants')
const { handler } = require('../../services/http')
const { webhookEvent } = require('../../services/stripe')
const {
  updateBy: updateAccountBy,
} = require('../../models/v1/accounts/repositories')
const {
  create: createSubscription,
  updateBy: updateSubscription,
  deleteBy: deleteSubscriptions,
} = require('../../models/v1/billing/subscriptions/repositories')
const { selectOneBy: getPackageBy } = require('../../models/v1/packages/repositories')

module.exports = handler(async ({ rawBody, headers }, res) => {
  // Retrieve the event by verifying the signature using the raw body and secret.
  const event = await webhookEvent(rawBody, headers['stripe-signature'])

  // Extract the object from the event.
  const data = event.data.object

  // TODO: implement it!!!!
  // https://stripe.com/docs/billing/subscriptions/integrating-customer-portal#redirect

  // eslint-disable-next-line quotes
  console.log("\n\n\n", event.type, data)

  // Handle the event
  // Review important events for Billing webhooks
  // https://stripe.com/docs/billing/webhooks
  // Remove comment to see the various objects sent for this sample
  switch (event.type) {
    case 'invoice.paid':
      // Used to provision services after the trial has ended.
      // The status of the invoice will show up as paid. Store the status in your
      // database to reference when a user accesses your service to avoid hitting rate limits.
      break

    case 'invoice.payment_failed':
      // If the payment fails or the customer does not have a valid payment method,
      //  an invoice.payment_failed event is sent, the subscription becomes past_due.
      // Use this webhook to notify your user that their payment has
      // failed and to retrieve new card details.
      await updateSubscription({ stripeSubscriptionId: data.subscription }, {
        status: SUBSCRIPTION_STATUS.UNPAID,
      })
      cache.del([
        `accounts.${data.metadata.identifier}.*`,
        `accounts.${data.metadata.account_id}.*`,
      ])
      break

    case 'invoice.finalized':
      // If you want to manually send out invoices to your customers
      // or store them locally to reference to avoid hitting Stripe rate limits.
      // TODO: send email that subscription is paid
      break

    case 'customer.subscription.deleted':
      if (event.request) {
        // handle a subscription cancelled by your request
        // from above.
      } else {
        // handle subscription cancelled automatically based
        // upon your subscription settings.
      }

      await updateSubscription({ accountId: data.metadata.account_id, stripeSubscriptionId: data.id }, {
        stripeCustomerId: data.customer,
        stripeSubscriptionId: data.id,
        stripePriceId: data.plan.id,
        stripeProductId: data.plan.product,
        stripePaymentMethodId: data.default_payment_method,
        status: data.status,
        interval: data.plan.interval,
        intervalCount: data.plan.interval_count,
        quantity: data.quantity,
        startDate: new Date(data.start_date * 1000),
        cancellationDate: new Date(),
        currentPeriodStartDate: new Date(data.current_period_start * 1000),
        currentPeriodEndDate: new Date(data.current_period_end * 1000),
      })
      // TODO: send email about subscription cancellation
      cache.del([
        `accounts.${data.metadata.identifier}.*`,
        `accounts.${data.metadata.account_id}.*`,
      ])
      break

    case 'checkout.session.completed': {
      await updateAccountBy({ id: data.metadata.account_id }, {
        stripeId: data.customer,
        trialExpirationOn: null,
      })
      cache.del([
        `accounts.${data.metadata.identifier}.*`,
        `accounts.${data.metadata.account_id}.*`,
      ])
      break
    }

    case 'customer.subscription.created': {
      const { id: packageId } = await getPackageBy({ stripeId: data.plan.product })

      await createSubscription({
        accountId: data.metadata.account_id,
        packageId,
        stripeCustomerId: data.customer,
        stripeSubscriptionId: data.id,
        stripePriceId: data.plan.id,
        stripeProductId: data.plan.product,
        stripePaymentMethodId: data.default_payment_method,
        status: data.status,
        interval: data.plan.interval,
        intervalCount: data.plan.interval_count,
        quantity: data.quantity,
        startDate: new Date(data.start_date * 1000),
        currentPeriodStartDate: new Date(data.current_period_start * 1000),
        currentPeriodEndDate: new Date(data.current_period_end * 1000),
      })
      cache.del([
        `accounts.${data.metadata.identifier}.*`,
        `accounts.${data.metadata.account_id}.*`,
      ])
      break
    }

    case 'customer.subscription.updated': {
      const { id: packageId } = await getPackageBy({ stripeId: data.plan.product })

      await updateSubscription({ accountId: data.metadata.account_id, stripeSubscriptionId: data.id }, {
        packageId,
        stripeCustomerId: data.customer,
        stripeSubscriptionId: data.id,
        stripePriceId: data.plan.id,
        stripeProductId: data.plan.product,
        stripePaymentMethodId: data.default_payment_method,
        status: data.status,
        interval: data.plan.interval,
        intervalCount: data.plan.interval_count,
        quantity: data.quantity,
        startDate: new Date(data.start_date * 1000),
        currentPeriodStartDate: new Date(data.current_period_start * 1000),
        currentPeriodEndDate: new Date(data.current_period_end * 1000),
      })
      if (data.status === SUBSCRIPTION_STATUS.ACTIVE) {
        await updateAccountBy({ id: data.metadata.account_id }, {
          packageId,
        })
        await deleteSubscriptions({ accountId: data.metadata.account_id, status: SUBSCRIPTION_STATUS.UNPAID })
      }
      cache.del([
        `accounts.${data.metadata.identifier}.*`,
        `accounts.${data.metadata.account_id}.*`,
      ])
      break
    }

    case 'customer.subscription.trial_will_end':
      if (event.request != null) {
        // handle a subscription cancelled by your request
        // from above.
      } else {
        // handle subscription cancelled automatically based
        // upon your subscription settings.
      }
      break

    default:
      // Unexpected event type
  }

  return res.sendStatus(200)
})
