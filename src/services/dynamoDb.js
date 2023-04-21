const config = require('config')

const aws = require('./aws')

aws.config.update({
  region: config.get('aws.region'),
})

const getClient = () => new aws.DynamoDB.DocumentClient()

exports.getItem = (options) => getClient().get(options).promise()

exports.scanItems = (options) => getClient().scan(options).promise()

exports.putItem = (options) => getClient().put(options).promise()
