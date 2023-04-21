const { seed } = require('../../src/services/seeder')
const { TABLE_NAME } = require('../../src/models/v1/dict-arrangements/constants')

exports.seed = (knex) => seed(knex, TABLE_NAME, [
  { type: 'rooms', name: 'bathroom', icon: 'bathroom' },
  { type: 'rooms', name: 'bedroom', icon: 'bedroom' },
  { type: 'rooms', name: 'diningRoom', icon: 'diningRoom' },
  { type: 'rooms', name: 'kitchen', icon: 'kitchen' },
  { type: 'rooms', name: 'livingRoom', icon: 'livingRoom' },
  { type: 'rooms', name: 'playroom', icon: 'playroom' },
  { type: 'rooms', name: 'toilet', icon: 'toilet' },
  { type: 'rooms', name: 'workroom', icon: 'workroom' },
  { type: 'rooms', name: 'balcony', icon: 'balcony' },
  { type: 'rooms', name: 'terrace', icon: 'terrace' },
  { type: 'sleeping', name: 'babyCrib', icon: 'babyCrib' },
  { type: 'sleeping', name: 'childBed', icon: 'childBed' },
  { type: 'sleeping', name: 'doubleBed', icon: 'doubleBed' },
  { type: 'sleeping', name: 'foldAwayBed', icon: 'foldAwayBed' },
  { type: 'sleeping', name: 'kingBed', icon: 'kingBed' },
  { type: 'sleeping', name: 'bunkBed', icon: 'bunkBed' },
  { type: 'sleeping', name: 'loftBed', icon: 'loftBed' },
  { type: 'sleeping', name: 'futonBed', icon: 'futonBed' },
  { type: 'sleeping', name: 'queenBed', icon: 'queenBed' },
  { type: 'sleeping', name: 'studioCouch', icon: 'studioCouch' },
  { type: 'sleeping', name: 'twinSingleBed', icon: 'twinSingleBed' },
])
