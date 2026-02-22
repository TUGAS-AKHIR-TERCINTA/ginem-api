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
