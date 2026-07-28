import axios from 'axios'
import { StatusCodes } from 'http-status-codes'

import { appConfigs } from '../configs/appConfig'
import { AppError } from '../utilities/AppError'
import logger from '../utilities/logger'

export type TtsAudioFormat = 'mp3' | 'wav'

export interface ChatAudioPayload {
  mimeType: 'audio/mpeg' | 'audio/wav'
  base64: string
  byteLength: number
  /** Text actually sent to OpenAI TTS (after cleanup). */
  speakText: string
}

const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech'
const MAX_INPUT_CHARS = 4096
const MIN_AUDIO_BYTES = 128

const MIME_BY_FORMAT: Record<TtsAudioFormat, ChatAudioPayload['mimeType']> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav'
}

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

/**
 * Normalize agent reply into natural speech text (avoid empty/ultra-short TTS).
 */
export function toSpeakableText(text: string): string {
  const trimmed = text.trim()
  if (trimmed === '') {
    return 'Maaf, saya tidak memiliki jawaban saat ini.'
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>
    const fromJson = extractSpeakableFromJson(parsed)
    if (fromJson != null && fromJson.length > 0) {
      return fromJson
    }
  } catch {
    // not JSON — continue with plain text cleanup
  }

  let speakable = trimmed
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (speakable.length < 8) {
    speakable = trimmed.replace(/\s+/g, ' ').trim()
  }

  if (speakable.length < 3) {
    return 'Maaf, saya tidak memiliki jawaban saat ini.'
  }

  return speakable.length > MAX_INPUT_CHARS
    ? speakable.slice(0, MAX_INPUT_CHARS)
    : speakable
}

function extractSpeakableFromJson(parsed: Record<string, unknown>): string | null {
  const candidates = [
    parsed.message,
    parsed.reply,
    parsed.answer,
    parsed.error,
    parsed.summary
  ]

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  if (parsed.success === true && typeof parsed.jobId === 'string') {
    return `Berhasil. ID jadwal ${parsed.jobId}.`
  }

  return null
}

function assertValidAudioBuffer(buffer: Buffer, format: TtsAudioFormat): void {
  if (buffer.length < MIN_AUDIO_BYTES) {
    throw new AppError(
      `TTS returned empty or too small audio (${buffer.length} bytes)`,
      StatusCodes.INTERNAL_SERVER_ERROR
    )
  }

  if (format === 'wav') {
    const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    if (!isRiff) {
      throw new AppError(
        'TTS returned invalid WAV payload (check OPENAI_API_KEY and TTS model)',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
    return
  }

  const head = buffer.subarray(0, Math.min(buffer.length, 512))
  const hasId3 = head.subarray(0, 3).toString('utf8') === 'ID3'
  let hasMp3Frame = false
  for (let i = 0; i < head.length - 1; i++) {
    if (head[i] === 0xff && (head[i + 1] & 0xe0) === 0xe0) {
      hasMp3Frame = true
      break
    }
  }

  if (!hasId3 && !hasMp3Frame) {
    throw new AppError(
      'TTS returned invalid MP3 payload (check OPENAI_API_KEY and TTS model)',
      StatusCodes.INTERNAL_SERVER_ERROR
    )
  }
}

export class TTSService {
  static async synthesizeSpeechBuffer(
    text: string,
    format: TtsAudioFormat = 'mp3'
  ): Promise<{
    buffer: Buffer
    speakText: string
    mimeType: ChatAudioPayload['mimeType']
  }> {
    const apiKey = appConfigs.llm.openAIApiKey
    if (apiKey == null || apiKey === '') {
      throw new AppError('OPENAI_API_KEY is not set', StatusCodes.INTERNAL_SERVER_ERROR)
    }

    const speakText = toSpeakableText(text)
    const model = appConfigs.tts.model
    const voice = appConfigs.tts.voice

    if (!ALLOWED_VOICES.has(voice)) {
      throw new AppError(`Invalid TTS voice: ${voice}`, StatusCodes.INTERNAL_SERVER_ERROR)
    }

    try {
      const response = await axios.post(
        OPENAI_TTS_URL,
        {
          model,
          input: speakText,
          voice,
          response_format: format
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: format === 'wav' ? 'audio/wav' : 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 120_000,
          decompress: true,
          validateStatus: (status) => status >= 200 && status < 300
        }
      )

      const buffer = Buffer.from(response.data as ArrayBuffer)
      assertValidAudioBuffer(buffer, format)

      logger.info(
        `[TTSService] Synthesized ${format} ${buffer.length} bytes for ${speakText.length} chars`
      )

      return {
        buffer,
        speakText,
        mimeType: MIME_BY_FORMAT[format]
      }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError

      let message = String(serviceError)
      if (axios.isAxiosError(serviceError) && serviceError.response?.data != null) {
        const errData = serviceError.response.data
        message =
          errData instanceof ArrayBuffer
            ? Buffer.from(errData).toString('utf8')
            : String(errData)
      }

      logger.error(`[TTSService] synthesizeSpeech failed: ${message}`)
      throw new AppError(
        'Failed to synthesize speech audio',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  static async synthesizeSpeech(
    text: string,
    format: TtsAudioFormat = 'mp3'
  ): Promise<ChatAudioPayload> {
    const { buffer, speakText, mimeType } = await TTSService.synthesizeSpeechBuffer(
      text,
      format
    )

    return {
      mimeType,
      base64: buffer.toString('base64'),
      byteLength: buffer.length,
      speakText
    }
  }
}
