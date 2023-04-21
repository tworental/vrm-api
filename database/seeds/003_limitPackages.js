/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-undef */
const { TABLE_NAME: TABLE_NAME_PACKAGES } = require('../../src/models/v1/packages/constants')
const { TABLE_NAME: TABLE_NAME_LIMITS } = require('../../src/models/v1/limits/constants')
const limitPackages = require('../../src/__fixtures__/limitPackages')
const { seed } = require('../../src/services/seeder')

exports.seed = async (knex) => {
  const payload = []

  for (const packageName in limitPackages) {
    const data = limitPackages[packageName]
    const packageData = await knex(TABLE_NAME_PACKAGES).where('name', '=', packageName).first()

    const packageLimits = await Promise.all(Object.entries(data).map(async ([limitName, value]) => {
      const limitsData = await knex(TABLE_NAME_LIMITS).where('name', '=', limitName).first()

      return {
        limit_id: limitsData.id,
        package_id: packageData.id,
        value,
      }
    }))

    payload.push(packageLimits)
  }

  return seed(knex, 'limit_packages', payload.flat())
}
