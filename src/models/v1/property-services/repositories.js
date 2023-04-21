const { raw } = require('../../../services/database')
const dao = require('../../../services/dao')

const { TABLE_NAME: PROPERTY_SERVICES_TABLE_NAME } = require('./constants')
const { TABLE_NAME: SERVICE_PROVIDERS_TABLE_NAME } = require('../service-providers/constants')
const { TABLE_NAME: SERVICES_TABLE_NAME } = require('../services/constants')

const withServices = (queryBuilder) => (
  queryBuilder
    .clearSelect()
    .join(SERVICES_TABLE_NAME, `${SERVICES_TABLE_NAME}.id`, `${PROPERTY_SERVICES_TABLE_NAME}.service_id`)
    .leftJoin(
      SERVICE_PROVIDERS_TABLE_NAME, `${SERVICE_PROVIDERS_TABLE_NAME}.id`, `${SERVICES_TABLE_NAME}.service_provider_id`,
    ).select([
      `${SERVICES_TABLE_NAME}.*`,
      `${PROPERTY_SERVICES_TABLE_NAME}.id`,
      raw(`${SERVICES_TABLE_NAME}.id AS serviceId`),
      raw(`${SERVICE_PROVIDERS_TABLE_NAME}.name AS serviceProviderName`),
    ])
)

module.exports = dao({
  tableName: PROPERTY_SERVICES_TABLE_NAME,
  methods: {
    withServices,
  },
})
