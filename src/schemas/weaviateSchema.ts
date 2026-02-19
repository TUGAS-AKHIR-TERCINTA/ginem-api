import { z } from 'zod'
import { jwtPayloadSchema } from './jwtPayloadSchema'

const indexItemSchema = z.object({
  text: z.string(),
  source: z.enum(['pdf', 'text'])
})

export const indexToWeaviateSchema = z.object({
  jwtPayload: jwtPayloadSchema,
  objects: z.array(indexItemSchema).min(1).max(100)
})

export type IndexToWeaviateSchema = z.infer<typeof indexToWeaviateSchema>
export type IndexItemSchema = z.infer<typeof indexItemSchema>
