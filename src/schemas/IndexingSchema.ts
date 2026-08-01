import { z } from 'zod'

export const findAllIndexingsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  pagination: z
    .string()
    .optional()
    .transform((v): boolean => v === 'true'),
  source: z
    .union([z.enum(['pdf', 'text']), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v))
})

export const createIndexingItemSchema = z
  .object({
    text: z.string().max(200_000),
    source: z.enum(['pdf', 'text'])
  })
  .strict()

/** Body POST indexing: array of chunks `{ text, source }`. */
export const createIndexingBodySchema = z.array(createIndexingItemSchema)

export const deleteIndexingParamsSchema = z.object({
  indexingId: z
    .string()
    .regex(/^\d+$/, { message: 'indexingId must be a positive integer' })
})

export type IFindAllIndexing = z.infer<typeof findAllIndexingsSchema>
export type IDeleteIndexing = z.infer<typeof deleteIndexingParamsSchema>
/** Single indexing chunk (API array element). */
export type ICreateIndexing = z.infer<typeof createIndexingItemSchema>
