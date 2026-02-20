import { z } from 'zod'

/** Schema for chat endpoint: user message to the chat agent */
export const chatSchema = z.object({
  message: z.string().min(1).max(2000)
})

export type ChatSchema = z.infer<typeof chatSchema>
