#!/usr/bin/env node

const minimist = require('minimist')

const { logError } = require('../services/logger')
const stripe = require('./stripe')
const limits = require('./limits')
const reminders = require('./reminders')
const exchangerateapi = require('./exchangerateapi')
const ownerReports = require('./owner-reports')

module.exports = async () => {
  const args = minimist(process.argv.slice(2))
  const [cmd, ...params] = args._

  switch (cmd) {
    case 'exchangerateapi':
      await exchangerateapi(...params)
      break

    case 'stripe':
      await stripe(...params)
      break

    case 'limits':
      await limits(...params)
      break

    case 'reminders':
      await reminders(...params)
      break

    case 'owner-reports':
      await ownerReports(...params)
      break

    default:
      logError(`"${cmd}" is not a valid command!`)
      break
  }

  process.exit(0)
}
