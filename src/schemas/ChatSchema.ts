import { z } from 'zod'

export const chatSchema = z.object({
  message: z.string().min(1).max(2000)
})

export type IChatSchema = z.infer<typeof chatSchema>
