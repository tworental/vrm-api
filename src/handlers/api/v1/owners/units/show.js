const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { sumArray, avgArray } = require('../../../../../services/number')
const {
  selectOneBy: selectUnitBy,
  withProperty,
} = require('../../../../../models/v1/units/repositories')
const {
  selectBy: selectPropertyImagesBy,
  withFiles,
} = require('../../../../../models/v1/property-images/repositories')
const {
  occupancyByYearAndMonth,
  calculateOccupancy,
} = require('../../../../../models/v1/statistics/repositories')

module.exports = handler(async ({ user: { id: ownerId, accountId }, params: { id } }, res) => {
  const unit = await withProperty(selectUnitBy())
    .select(['address'])
    .where('property_unit_type_units.id', '=', id)
    .where('account_id', '=', accountId)
    .where('owner_id', '=', ownerId)

  const images = await withFiles(selectPropertyImagesBy({}))
    .where('main', 1)
    .where('propertyUnitTypeId', unit.propertyUnitTypeId)

  const photo = images.find((image) => image.propertyUnitTypeId === unit.propertyUnitTypeId)

  const occupancyData = await occupancyByYearAndMonth(accountId)(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    [id],
  )

  const occupancyByUnit = occupancyData.filter((item) => item.propertyUnitTypeUnitId === unit.id)

  const { data: [unitOccupancy] } = calculateOccupancy(
    [occupancyByUnit],
  )

  const occupancy = {
    ...unitOccupancy,
    bookedNights: sumArray(occupancyByUnit, 'totalNights'),
    avgRate: avgArray(occupancyByUnit, 'amount'),
  }

  const data = {
    id: unit.id,
    name: unit.propertyName,
    photo: photo ? photo.publicUrl : null,
    address: unit.address ? unit.address.formattedAddress : null,
    room: unit.name,
    bookedNights: occupancy.bookedNights,
    occupancy: roundTo(occupancy.occupancy, 2),
    avgNightlyRate: roundTo(occupancy.avgRate, 2),
  }

  return res.json({ data })
})
