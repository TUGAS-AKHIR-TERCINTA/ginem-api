import {
  whatsappConnectBodySchema,
  whatsappConnectQuerySchema,
  whatsappDisconnectBodySchema
} from '../WhatsAppSchema'

describe('WhatsAppSchema', () => {
  describe('whatsappConnectBodySchema', () => {
    it('defaults to empty object', () => {
      expect(whatsappConnectBodySchema.parse(undefined)).toEqual({})
    })

    it('rejects unknown body fields', () => {
      const result = whatsappConnectBodySchema.safeParse({ extra: true })

      expect(result.success).toBe(false)
    })
  })

  describe('whatsappConnectQuerySchema', () => {
    it('accepts optional QR response type', () => {
      const result = whatsappConnectQuerySchema.parse({ type: 'base64' })

      expect(result.type).toBe('base64')
    })

    it('coerces timeoutMs to number', () => {
      const result = whatsappConnectQuerySchema.parse({ timeoutMs: '30000' })

      expect(result.timeoutMs).toBe(30000)
    })

    it('rejects timeout above 120000', () => {
      const result = whatsappConnectQuerySchema.safeParse({ timeoutMs: 120001 })

      expect(result.success).toBe(false)
    })
  })

  describe('whatsappDisconnectBodySchema', () => {
    it('defaults to empty object', () => {
      expect(whatsappDisconnectBodySchema.parse(undefined)).toEqual({})
    })
  })
})
