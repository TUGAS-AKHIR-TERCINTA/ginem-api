jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    secret: { passwordEncryption: 'test-password-salt' }
  }
}))

import { hashPassword } from '../scurePassword'

describe('hashPassword', () => {
  it('returns a deterministic sha1 hex hash', () => {
    const first = hashPassword('secret123')
    const second = hashPassword('secret123')

    expect(first).toBe(second)
    expect(first).toMatch(/^[a-f0-9]{40}$/)
  })

  it('returns different hashes for different passwords', () => {
    expect(hashPassword('password-a')).not.toBe(hashPassword('password-b'))
  })
})
