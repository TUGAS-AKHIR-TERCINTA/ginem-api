import {
  createIndexingBodySchema,
  createIndexingItemSchema,
  deleteIndexingParamsSchema,
  findAllIndexingsSchema
} from '../IndexingSchema'

describe('IndexingSchema', () => {
  describe('findAllIndexingsSchema', () => {
    it('applies defaults and normalizes empty filters', () => {
      const result = findAllIndexingsSchema.parse({})

      expect(result.page).toBe(1)
      expect(result.size).toBe(20)
      expect(result.source).toBeUndefined()
      expect(result.search).toBeUndefined()
    })

    it('transforms empty source and search strings to undefined', () => {
      const result = findAllIndexingsSchema.parse({
        source: '',
        search: ''
      })

      expect(result.source).toBeUndefined()
      expect(result.search).toBeUndefined()
    })
  })

  describe('createIndexingItemSchema', () => {
    it('accepts text indexing item', () => {
      const result = createIndexingItemSchema.parse({
        text: 'Device manual content',
        source: 'text'
      })

      expect(result.source).toBe('text')
    })

    it('rejects unknown fields', () => {
      const result = createIndexingItemSchema.safeParse({
        text: 'content',
        source: 'text',
        extra: true
      })

      expect(result.success).toBe(false)
    })
  })

  describe('createIndexingBodySchema', () => {
    it('accepts an array of indexing chunks', () => {
      const result = createIndexingBodySchema.parse([
        { text: 'Chunk A', source: 'text' },
        { text: 'Chunk B', source: 'pdf' }
      ])

      expect(result).toHaveLength(2)
    })
  })

  describe('deleteIndexingParamsSchema', () => {
    it('accepts numeric string indexingId', () => {
      const result = deleteIndexingParamsSchema.parse({ indexingId: '42' })

      expect(result.indexingId).toBe('42')
    })

    it('rejects non-numeric indexingId', () => {
      const result = deleteIndexingParamsSchema.safeParse({ indexingId: 'abc' })

      expect(result.success).toBe(false)
    })
  })
})
