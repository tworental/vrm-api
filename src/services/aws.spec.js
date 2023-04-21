const aws = require('aws-sdk')

const awsSdk = require('./aws')

describe('aws service', () => {
  it('should create a new aws sdk instance', () => {
    expect(awsSdk).toBe(aws)
  })
})
