import { z } from 'zod'

const vectorIndexSourceEnum = z.enum(['pdf', 'text'])

/**
 * Query schema for GET /vector-indexes (list with pagination)
 */
export const findAllVectorIndexesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  pagination: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  source: z
    .union([vectorIndexSourceEnum, z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  search: z
    .union([z.string(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v))
})

export type FindAllVectorIndexesInput = z.infer<typeof findAllVectorIndexesSchema>

const indexPineconeItemSchema = z
  .object({
    text: z.string().max(200_000),
    source: vectorIndexSourceEnum
  })
  .strict()

/**
 * Body POST /vector-indexes/pinecone/chunks: JSON array `[{ "text": "...", "source": "text" | "pdf" }]`.
 */
export const indexPineconeChunksBodySchema = z
  .array(indexPineconeItemSchema)
  .min(1)
  .max(100)
  .superRefine((items, ctx) => {
    items.forEach((item, i) => {
      if (item.text.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'text must not be empty or whitespace-only',
          path: [i, 'text']
        })
      }
    })
  })

export const DeleteIndexingParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'id must be a positive integer' })
})

export type IDeleteIndexingParams = z.infer<typeof DeleteIndexingParamsSchema>
export type IndexPineconeChunksBodyInput = z.infer<typeof indexPineconeChunksBodySchema>
