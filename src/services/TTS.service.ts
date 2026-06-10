import axios from 'axios'
import { StatusCodes } from 'http-status-codes'

import { appConfigs } from '../configs/appConfig'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'

export type ChatAudioPayload = {
  mimeType: 'audio/mpeg'
  base64: string
}

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech'
const MAX_INPUT_CHARS = 4096

const ALLOWED_VOICES = new Set([
  'alloy',
  'ash',
  'coral',
  'echo',
  'fable',
  'nova',
  'onyx',
  'sage',
  'shimmer'
])

export class TTSService {
  static async synthesizeSpeech(text: string): Promise<ChatAudioPayload> {
    const apiKey = appConfigs.llm.openAIApiKey
    if (apiKey == null || apiKey === '') {
      throw new AppError('OPENAI_API_KEY is not set', StatusCodes.INTERNAL_SERVER_ERROR)
    }

    const trimmed = text.trim()
    if (trimmed === '') {
      throw AppError.badRequest('Cannot synthesize empty speech text')
    }

    const model = appConfigs.tts.model
    const voice = appConfigs.tts.voice

    if (!ALLOWED_VOICES.has(voice)) {
      throw new AppError(`Invalid TTS voice: ${voice}`, StatusCodes.INTERNAL_SERVER_ERROR)
    }

    const input =
      trimmed.length > MAX_INPUT_CHARS ? trimmed.slice(0, MAX_INPUT_CHARS) : trimmed

    try {
      const response = await axios.post(
        OPENAI_TTS_URL,
        {
          model,
          input,
          voice,
          response_format: 'mp3'
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer',
          timeout: 60_000
        }
      )

      const base64 = Buffer.from(response.data as ArrayBuffer).toString('base64')

      return {
        mimeType: 'audio/mpeg',
        base64
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError

      const message =
        axios.isAxiosError(serviceError) && serviceError.response?.data != null
          ? String(serviceError.response.data)
          : String(serviceError)

      logger.error(`[TTSService] synthesizeSpeech failed: ${message}`)
      throw new AppError(
        'Failed to synthesize speech audio',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
