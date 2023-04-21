const dao = require('../../../services/dao')

const { TABLE_NAME } = require('./constants')

module.exports = dao({
  tableName: TABLE_NAME,
  jsonFields: ['reminders'],
})
