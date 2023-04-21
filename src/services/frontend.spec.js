const config = require('config')

const utilityService = require('./frontend')

jest.mock('config')

describe('frontend service', () => {
  const endpoint = 'http://%s.domain.com'
  const localhost = 'http://localhost:3000'

  it('should return correct frontend url', () => {
    expect(utilityService.frontendUrl(endpoint, 'org'))
      .toEqual('http://org.domain.com/')

    expect(utilityService.frontendUrl(endpoint, 'org', '/url'))
      .toEqual('http://org.domain.com/url')

    expect(utilityService.frontendUrl(endpoint, 'org', '/url', { token: 'TOKEN' }))
      .toEqual('http://org.domain.com/url?token=TOKEN')

    expect(utilityService.frontendUrl(localhost, 'org', '/url'))
      .toEqual('http://localhost:3000/url')
  })

  it('should return correct domain', () => {
    expect(utilityService.domainName(endpoint, 'org')).toEqual('org.domain.com')
  })

  it('should return correct api url for localhost with http', () => {
    config.get.mockReturnValueOnce('localhost:3000')

    expect(utilityService.apiUrl('bookings', { dateArrival: '2021-01-01' }))
      .toEqual('http://localhost:3000/v1/app/bookings?dateArrival=2021-01-01')
  })

  it('should return correct api url for external service with https', () => {
    config.get.mockReturnValueOnce('api.tworentals.dev')

    expect(utilityService.apiUrl('bookings', { dateArrival: '2021-01-01' }))
      .toEqual('https://api.tworentals.dev/v1/app/bookings?dateArrival=2021-01-01')
  })

  it('should return correct webhook url for localhost with http', () => {
    config.get.mockReturnValueOnce('localhost:3000')

    expect(utilityService.webhookUrl('channex/bookings', { dateArrival: '2021-01-01' }))
      .toEqual('http://localhost:3000/webhooks/channex/bookings?dateArrival=2021-01-01')
  })

  it('should return correct webhook url for external service with https', () => {
    config.get.mockReturnValueOnce('api.tworentals.dev')

    expect(utilityService.webhookUrl('channex/bookings', { dateArrival: '2021-01-01' }))
      .toEqual('https://api.tworentals.dev/webhooks/channex/bookings?dateArrival=2021-01-01')
  })
})
