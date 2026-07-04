import { chatSchema, ttsPreviewSchema } from '../ChatSchema'

describe('ChatSchema', () => {
  describe('chatSchema', () => {
    it('accepts a valid chat message', () => {
      const result = chatSchema.parse({ message: 'Turn on the light' })

      expect(result.withAudio).toBe(false)
      expect(result.audioFormat).toBe('json')
    })

    it('rejects empty message', () => {
      const result = chatSchema.safeParse({ message: '' })

      expect(result.success).toBe(false)
    })

    it('rejects message longer than 2000 characters', () => {
      const result = chatSchema.safeParse({ message: 'a'.repeat(2001) })

      expect(result.success).toBe(false)
    })

    it('rejects binary audio format without withAudio', () => {
      const result = chatSchema.safeParse({
        message: 'Hello',
        audioFormat: 'binary'
      })

      expect(result.success).toBe(false)
    })

    it('accepts binary audio format when withAudio is true', () => {
      const result = chatSchema.parse({
        message: 'Hello',
        withAudio: true,
        audioFormat: 'binary'
      })

      expect(result.withAudio).toBe(true)
      expect(result.audioFormat).toBe('binary')
    })
  })

  describe('ttsPreviewSchema', () => {
    it('accepts preview text within limits', () => {
      const result = ttsPreviewSchema.parse({ text: 'Halo, ini tes suara.' })

      expect(result.text).toBe('Halo, ini tes suara.')
    })

    it('rejects empty preview text', () => {
      const result = ttsPreviewSchema.safeParse({ text: '' })

      expect(result.success).toBe(false)
    })
  })
})
