const { seed } = require('../../src/services/seeder')
const { TABLE_NAME } = require('../../src/models/v1/limits/constants')
const data = require('../../src/__fixtures__/limits')

exports.seed = (knex) => seed(knex, TABLE_NAME, data, 'name')
