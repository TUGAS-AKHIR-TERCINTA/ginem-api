import { z } from 'zod'

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  withAudio: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'When true, response includes natural speech audio (OpenAI TTS) for data.reply'
    )
})

export type IChatSchema = z.infer<typeof chatSchema>
