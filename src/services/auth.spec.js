const { verify, sign } = require('jsonwebtoken')
const config = require('config')

const { Unauthorized } = require('./errors')

jest.mock('jsonwebtoken')
jest.mock('config')

const {
  authByUserJwt,
  authByOwnerJwt,
  authByTenantJwt,
  signTokenByUserJwt,
  signTokenByOwnerJwt,
  signTokenByTenantJwt,
  parseToken,
} = require('./auth')

describe('auth service', () => {
  const time = 1479427200000

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => time)
  })

  describe('user JWT', () => {
    const expiresIn = 'guards.user.accessTokenTtl'
    const secret = 'guards.user.secret'
    const role = 'guards.user.roleName'

    it('should verify an user token', async () => {
      const decodedToken = { data: 'data' }

      verify.mockImplementation((token, str, callback) => callback('', decodedToken))

      const token = 'JWT'

      expect(await authByUserJwt(token)).toEqual(decodedToken)

      expect(verify).toBeCalledWith(token, secret, expect.any(Function))
      expect(config.get).toHaveBeenNthCalledWith(1, secret)
    })

    it('should return an error because the verification of the token failed', async () => {
      const message = 'error'

      verify.mockImplementation((token, str, callback) => callback(new Error(message)))

      await expect(authByUserJwt('wrongToken')).rejects.toThrow(new Unauthorized(message))
    })

    it('should sign an user token', async () => {
      const accessToken = 'TOKEN'
      const subject = 1
      const issuer = 'iss'

      const data = {
        jwtid: time.toString(),
        subject: subject.toString(),
        issuer,
        expiresIn,
      }

      sign.mockImplementation((extra, str, payload, callback) => callback('', accessToken))

      expect(await signTokenByUserJwt(subject, issuer)).toEqual({
        accessToken,
        expiresIn,
      })

      expect(sign).toBeCalledWith({ role }, secret, data, expect.any(Function))
      expect(config.get).toHaveBeenNthCalledWith(4, secret)
      expect(config.get).toHaveBeenNthCalledWith(5, expiresIn)
      expect(config.get).toHaveBeenNthCalledWith(6, role)
    })

    it('should return an error because the sign of the user token failed', async () => {
      const message = 'error'

      sign.mockImplementation((extra, str, payload, callback) => callback(new Error(message)))

      await expect(signTokenByUserJwt(1, 'iss')).rejects.toThrow(new Unauthorized(message))
    })
  })

  describe('owner JWT', () => {
    const expiresIn = 'guards.owner.accessTokenTtl'
    const secret = 'guards.owner.secret'
    const role = 'guards.owner.roleName'

    it('should verify an owner token', async () => {
      const decodedToken = { data: 'data' }

      verify.mockImplementation((token, str, callback) => callback('', decodedToken))

      const token = 'JWT'

      expect(await authByOwnerJwt(token)).toEqual(decodedToken)

      expect(verify).toBeCalledWith(token, secret, expect.any(Function))
      expect(config.get).toHaveBeenNthCalledWith(2, secret)
    })

    it('should return an error because the verification of the token failed', async () => {
      const message = 'error'

      verify.mockImplementation((token, str, callback) => callback(new Error(message)))

      await expect(authByOwnerJwt('wrongToken')).rejects.toThrow(new Unauthorized(message))
    })

    it('should sign an owner token', async () => {
      const accessToken = 'TOKEN'
      const subject = 1
      const issuer = 'iss'

      const data = {
        jwtid: time.toString(),
        subject: subject.toString(),
        issuer,
        expiresIn,
      }

      sign.mockImplementation((extra, str, payload, callback) => callback('', accessToken))

      expect(await signTokenByOwnerJwt(subject, issuer)).toEqual({
        accessToken,
        expiresIn,
      })

      expect(sign).toBeCalledWith({ role }, secret, data, expect.any(Function))
      expect(config.get).toHaveBeenNthCalledWith(7, secret)
      expect(config.get).toHaveBeenNthCalledWith(8, expiresIn)
      expect(config.get).toHaveBeenNthCalledWith(9, role)
    })

    it('should return an error because the sign of the owner token failed', async () => {
      const message = 'error'

      sign.mockImplementation((extra, str, payload, callback) => callback(new Error(message)))

      await expect(signTokenByOwnerJwt(1, 'iss')).rejects.toThrow(new Unauthorized(message))
    })
  })

  describe('tenant JWT', () => {
    const expiresIn = 'guards.tenant.accessTokenTtl'
    const secret = 'guards.tenant.secret'
    const role = 'guards.tenant.roleName'

    it('should verify a tenant token', async () => {
      const decodedToken = { data: 'data' }

      verify.mockImplementation((token, str, callback) => callback('', decodedToken))

      const token = 'JWT'

      expect(await authByTenantJwt(token)).toEqual(decodedToken)

      expect(verify).toBeCalledWith(token, secret, expect.any(Function))
      expect(config.get).toHaveBeenNthCalledWith(3, secret)
    })

    it('should return an error because the verification of the token failed', async () => {
      const message = 'error'

      verify.mockImplementation((token, str, callback) => callback(new Error(message)))

      await expect(authByTenantJwt('wrongToken')).rejects.toThrow(new Unauthorized(message))
    })

    it('should sign a tenant token', async () => {
      const accessToken = 'TOKEN'
      const subject = 1
      const issuer = 'iss'

      const data = {
        jwtid: time.toString(),
        subject: subject.toString(),
        issuer,
        expiresIn,
      }

      sign.mockImplementation((extra, str, payload, callback) => callback('', accessToken))

      expect(await signTokenByTenantJwt(subject, issuer)).toEqual({
        accessToken,
        expiresIn,
      })

      expect(sign).toBeCalledWith({ role }, secret, data, expect.any(Function))
      expect(config.get).toHaveBeenNthCalledWith(10, secret)
      expect(config.get).toHaveBeenNthCalledWith(11, expiresIn)
      expect(config.get).toHaveBeenNthCalledWith(12, role)
    })

    it('should return an error because the sign of the owner token failed', async () => {
      const message = 'error'

      sign.mockImplementation((extra, str, payload, callback) => callback(new Error(message)))

      await expect(signTokenByTenantJwt(1, 'iss')).rejects.toThrow(new Unauthorized(message))
    })
  })

  describe('parseToken', () => {
    it('should returns correctly parsed token', async () => {
      await expect(parseToken({ headers: { authorization: 'Bearer  TOKEN ' } })).resolves.toEqual('TOKEN')
    })

    it('should thrown an error if token is malformed', async () => {
      await expect(parseToken({ method: 'POST', headers: { authorization: 'XXX' } })).rejects
        .toThrow(new Unauthorized('Missing or malformed token'))
    })

    it('should thrown an error if token does not exists', async () => {
      await expect(parseToken({ method: 'POST', headers: {} })).rejects
        .toThrow(new Unauthorized('Missing or malformed token'))
    })
  })
})
