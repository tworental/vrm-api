const { seed } = require('../../src/services/seeder')
const { TABLE_NAME } = require('../../src/models/v1/dict-guest-types/constants')

exports.seed = (knex) => seed(knex, TABLE_NAME, [
  { name: 'notSpecified' },
  { name: 'group' },
  { name: 'youngCouple' },
  { name: 'matureCouple' },
  { name: 'familyWithNoChildren' },
  { name: 'familyWithYoungChildren' },
  { name: 'familyWithOlderChildren' },
  { name: 'withDisabled' },
  { name: 'singleTraveller' },
  { name: 'guestsWithPets' },
  { name: 'other' },
])
