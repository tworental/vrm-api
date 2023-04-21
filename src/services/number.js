exports.sumArray = (array, key = null) => array.reduce((acc, curr) => acc + (key ? curr[key] : curr), 0)

exports.avgArray = (array, key = null) => exports.sumArray(array, key) / Math.max(array.length, 1)
