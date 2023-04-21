const cron = require('node-cron')

const exchangerateapi = require('./tasks/exchangerateapi')
const reminders = require('./tasks/reminders')

// NOTE: execute every one minute
cron.schedule('* * * * *', () => {

})

// NOTE: execute everyday every 6 hours
cron.schedule('0 */6 * * *', () => {
  exchangerateapi()
})

// NOTE: execute every five minutes
cron.schedule('*/5 * * * *', () => {
  reminders({ timeRange: 5 })
})
