import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import { TTSService, toSpeakableText } from '../TTS.service'

jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    llm: { openAIApiKey: 'test-openai-key' },
    tts: { model: 'tts-1-hd', voice: 'nova' }
  }
}))

jest.mock('../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('toSpeakableText', () => {
  it('returns fallback for empty text', () => {
    expect(toSpeakableText('')).toBe('Maaf, saya tidak memiliki jawaban saat ini.')
  })

  it('extracts reply field from JSON payload', () => {
    expect(toSpeakableText('{"reply":"Lampu sudah dinyalakan."}')).toBe(
      'Lampu sudah dinyalakan.'
    )
  })

  it('strips markdown from plain text', () => {
    expect(toSpeakableText('**Lampu** sudah menyala')).toBe('Lampu sudah menyala')
  })
})

describe('TTSService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('synthesizes speech and returns base64 payload', async () => {
    const mp3Header = Buffer.alloc(256, 0)
    mp3Header[0] = 0xff
    mp3Header[1] = 0xfb
    mockedAxios.post.mockResolvedValue({ data: mp3Header })

    const result = await TTSService.synthesizeSpeech('Lampu sudah dinyalakan.')

    expect(result.mimeType).toBe('audio/mpeg')
    expect(result.base64).toBe(mp3Header.toString('base64'))
    expect(result.byteLength).toBe(256)
    expect(result.speakText).toBe('Lampu sudah dinyalakan.')
  })

  it('wraps axios failures', async () => {
    mockedAxios.post.mockRejectedValue(new Error('network error'))
    mockedAxios.isAxiosError.mockReturnValue(false)

    await expect(TTSService.synthesizeSpeech('Hello world')).rejects.toMatchObject({
      message: 'Failed to synthesize speech audio',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})
