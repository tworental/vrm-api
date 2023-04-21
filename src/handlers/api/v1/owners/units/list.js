const roundTo = require('round-to')

const { handler } = require('../../../../../services/http')
const { sumArray, avgArray } = require('../../../../../services/number')
const {
  selectBy: selectUnitsBy,
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

module.exports = handler(async ({ user: { id, accountId } }, res) => {
  const units = await withProperty(selectUnitsBy())
    .select(['address'])
    .where('account_id', '=', accountId)
    .where('owner_id', '=', id)

  const images = await withFiles(selectPropertyImagesBy({}))
    .where('main', 1)
    .whereIn('propertyUnitTypeId', units.map((unit) => unit.propertyUnitTypeId))

  const occupancyData = await occupancyByYearAndMonth(accountId)(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    units.map((unit) => unit.id),
  )

  const occupancy = units.map(
    (unit) => {
      const occupancyByUnit = occupancyData.filter((item) => item.propertyUnitTypeUnitId === unit.id)

      const { data: [unitOccupancy] } = calculateOccupancy(
        [occupancyByUnit],
      )

      return {
        ...unitOccupancy,
        bookedNights: sumArray(occupancyByUnit, 'totalNights'),
        avgRate: avgArray(occupancyByUnit, 'amount'),
        id: unit.id,
      }
    },
  )

  const data = units.map((unit) => {
    const photo = images.find((image) => image.propertyUnitTypeId === unit.propertyUnitTypeId)
    const occupancyItem = occupancy.find((item) => item.id === unit.id)

    return {
      id: unit.id,
      name: unit.propertyName,
      photo: photo ? photo.publicUrl : null,
      address: unit.address ? unit.address.formattedAddress : null,
      room: unit.name,
      bookedNights: occupancyItem.bookedNights,
      occupancy: roundTo(occupancyItem.occupancy, 2),
      avgNightlyRate: roundTo(occupancyItem.avgRate, 2),
    }
  })

  return res.json({ data })
})
