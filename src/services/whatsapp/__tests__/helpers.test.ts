import {
  disconnectErrorMessage,
  disconnectStatusCode,
  isTransientDisconnect,
  plainTextFromMessage
} from '../helpers'

describe('whatsapp helpers', () => {
  const lastDisconnect = (error: Error & { output?: { statusCode?: number } }) => ({
    error,
    date: new Date()
  })

  describe('disconnectStatusCode', () => {
    it('returns boom status code when available', () => {
      const code = disconnectStatusCode(
        lastDisconnect(Object.assign(new Error('closed'), { output: { statusCode: 428 } }))
      )

      expect(code).toBe(428)
    })

    it('returns undefined when disconnect info is missing', () => {
      expect(disconnectStatusCode(undefined)).toBeUndefined()
    })
  })

  describe('disconnectErrorMessage', () => {
    it('prefers error message over status code', () => {
      const message = disconnectErrorMessage(
        lastDisconnect(
          Object.assign(new Error('connection lost'), { output: { statusCode: 500 } })
        )
      )

      expect(message).toBe('connection lost')
    })
  })

  describe('isTransientDisconnect', () => {
    const disconnectReason = {
      restartRequired: 1,
      connectionClosed: 2,
      connectionLost: 3,
      timedOut: 4
    }

    it('returns true for transient disconnect codes', () => {
      expect(isTransientDisconnect(2, disconnectReason)).toBe(true)
      expect(isTransientDisconnect(4, disconnectReason)).toBe(true)
    })

    it('returns false for null or non-transient codes', () => {
      expect(isTransientDisconnect(undefined, disconnectReason)).toBe(false)
      expect(isTransientDisconnect(999, disconnectReason)).toBe(false)
    })
  })

  describe('plainTextFromMessage', () => {
    it('reads conversation text', () => {
      expect(plainTextFromMessage({ conversation: 'Turn on light' })).toBe('Turn on light')
    })

    it('reads extended text message', () => {
      expect(
        plainTextFromMessage({
          extendedTextMessage: { text: 'What is the temperature?' }
        })
      ).toBe('What is the temperature?')
    })

    it('returns undefined when no text is present', () => {
      expect(plainTextFromMessage({})).toBeUndefined()
    })
  })
})
