import { z } from 'zod'

const vectorIndexSourceEnum = z.enum(['pdf', 'text'])

export const findAllIndexingsSchema = z.object({
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

export const createIndexingItemSchema = z
  .object({
    text: z.string().max(200_000),
    source: vectorIndexSourceEnum
  })
  .strict()

export const createIndexingBodySchema = z
  .array(createIndexingItemSchema)
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

export const deleteIndexingParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, { message: 'id must be a positive integer' })
})

export type FindAllIndexingsInput = z.infer<typeof findAllIndexingsSchema>
export type IDeleteIndexingParams = z.infer<typeof deleteIndexingParamsSchema>
export type CreateIndexingBodyInput = z.infer<typeof createIndexingBodySchema>
