import { z } from 'zod'

export const chatSchema = z
  .object({
    message: z.string().min(1).max(2000),
    sessionId: z
      .string()
      .min(1)
      .max(191)
      .optional()
      .describe(
        'Optional conversation session id. Defaults to web:{userId} when omitted.'
      ),
    withAudio: z
      .boolean()
      .optional()
      .default(false)
      .describe('When true, synthesizes OpenAI TTS audio for the agent reply'),
    audioFormat: z
      .enum(['json', 'binary'])
      .optional()
      .default('json')
      .describe(
        'json = reply + audio.base64 in JSON (for web app). binary = raw WAV body (for Swagger download/play). Requires withAudio=true.'
      )
  })
  .refine((data) => data.audioFormat !== 'binary' || data.withAudio, {
    message: 'audioFormat "binary" requires withAudio to be true'
  })

export const ttsPreviewSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(500)
    .describe('Sample text to synthesize as WAV for browser playback test')
})

export type IChatSchema = z.infer<typeof chatSchema>
export type ITtsPreviewSchema = z.infer<typeof ttsPreviewSchema>
