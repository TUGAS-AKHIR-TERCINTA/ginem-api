import {
  updatePasswordSchema,
  userLoginSchema,
  userRegistrationSchema,
  userUpdatePasswordSchema
} from '../AuthSchema'

describe('AuthSchema', () => {
  describe('userLoginSchema', () => {
    it('accepts valid login credentials', () => {
      const result = userLoginSchema.safeParse({
        userEmail: 'user@example.com',
        userPassword: 'secret'
      })

      expect(result.success).toBe(true)
    })

    it('rejects empty email', () => {
      const result = userLoginSchema.safeParse({
        userEmail: '',
        userPassword: 'secret'
      })

      expect(result.success).toBe(false)
    })
  })

  describe('userRegistrationSchema', () => {
    it('accepts valid registration payload and defaults role to user', () => {
      const result = userRegistrationSchema.parse({
        userEmail: 'new@example.com',
        userPassword: 'secret12'
      })

      expect(result.userRole).toBe('user')
    })

    it('rejects password shorter than 6 characters', () => {
      const result = userRegistrationSchema.safeParse({
        userEmail: 'new@example.com',
        userPassword: '12345'
      })

      expect(result.success).toBe(false)
    })

    it('accepts admin role', () => {
      const result = userRegistrationSchema.parse({
        userEmail: 'admin@example.com',
        userPassword: 'secret12',
        userRole: 'admin'
      })

      expect(result.userRole).toBe('admin')
    })
  })

  describe('updatePasswordSchema', () => {
    it('requires email and minimum password length', () => {
      const result = updatePasswordSchema.safeParse({
        userEmail: 'user@example.com',
        userPassword: 'newpass'
      })

      expect(result.success).toBe(true)
    })
  })

  describe('userUpdatePasswordSchema', () => {
    it('matches updatePasswordSchema rules', () => {
      const result = userUpdatePasswordSchema.safeParse({
        userEmail: 'user@example.com',
        userPassword: 'abcdef'
      })

      expect(result.success).toBe(true)
    })
  })
})
