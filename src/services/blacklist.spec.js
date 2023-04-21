const config = require('config')

jest.mock('config')

const blacklistService = require('./blacklist')

describe('blacklist service', () => {
  const email = 'email'
  const ip = 'ip'

  beforeAll(() => {
    config.get.mockImplementation((key) => ({
      'blacklist.emails': [email],
      'blacklist.ips': [ip],
    }[key]))
  })

  it('should email be blacklisted', () => {
    expect(blacklistService.isEmailBlacklisted(email)).toBeTruthy()
    expect(config.get).toBeCalledWith('blacklist.emails')
  })

  it('should ip be blacklisted', () => {
    expect(blacklistService.isIpBlacklisted(ip)).toBeTruthy()
    expect(config.get).toBeCalledWith('blacklist.ips')
  })
})
