const { seed } = require('../../src/services/seeder')
const { TABLE_NAME } = require('../../src/models/v1/dict-property-types/constants')

exports.seed = (knex) => seed(knex, TABLE_NAME, [
  { name: 'bedAndBreakfast' },
  { name: 'boat' },
  { name: 'bungalow' },
  { name: 'camping' },
  { name: 'chalet' },
  { name: 'farmHouse' },
  { name: 'hospital' },
  { name: 'hostel' },
  { name: 'hotel' },
  { name: 'inn' },
  { name: 'mobileHouse' },
  { name: 'motel' },
  { name: 'normalApartment' },
  { name: 'normalHouse' },
  { name: 'resort' },
  { name: 'room' },
  { name: 'studentHousing' },
  { name: 'villa' },
])
