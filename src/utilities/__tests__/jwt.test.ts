import { generateAccessToken, verifyAccessToken } from '../jwt'

jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    secret: { jwtToken: 'test-jwt-secret-key' }
  }
}))

describe('jwt utilities', () => {
  const payload = {
    userId: 1,
    userEmail: 'user@example.com',
    userRole: 'user' as const
  }

  it('generates and verifies a valid access token', () => {
    const token = generateAccessToken(payload)
    const decoded = verifyAccessToken(token)

    expect(typeof token).toBe('string')
    expect(decoded).toMatchObject(payload)
  })

  it('returns false for an invalid token', () => {
    expect(verifyAccessToken('invalid.token.value')).toBe(false)
  })
})
