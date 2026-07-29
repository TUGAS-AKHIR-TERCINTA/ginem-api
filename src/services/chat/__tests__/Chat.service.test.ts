import { StatusCodes } from 'http-status-codes'

import { createAgent } from 'langchain'
import { ChatService } from '../Chat.service'
import { pineconeService } from '../../rag'
import { TTSService } from '../TTS.service'

jest.mock('langchain', () => ({
  createAgent: jest.fn(() => ({
    invoke: jest.fn()
  }))
}))

jest.mock('../../llm', () => ({
  LLMService: { create: jest.fn(() => ({})) }
}))

jest.mock('../TTS.service', () => ({
  TTSService: {
    synthesizeSpeech: jest.fn()
  }
}))

jest.mock('../../rag', () => ({
  pineconeService: {
    search: jest.fn()
  }
}))

jest.mock('../../mcp/tools/index', () => ({
  deviceTools: []
}))

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

const mockInvoke = (createAgent as jest.Mock).mock.results[0].value.invoke as jest.Mock
const mockedPinecone = pineconeService as jest.Mocked<typeof pineconeService>
const mockedTTS = TTSService as jest.Mocked<typeof TTSService>

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedPinecone.search.mockResolvedValue([])
    mockInvoke.mockResolvedValue({
      messages: [{ content: 'Lampu sudah dinyalakan.' }]
    })
  })

  it('returns text reply without audio by default', async () => {
    const result = await ChatService.query('Nyalakan lampu')

    expect(result).toEqual({ reply: 'Lampu sudah dinyalakan.' })
    expect(mockedTTS.synthesizeSpeech).not.toHaveBeenCalled()
  })

  it('includes RAG context when pinecone returns hits', async () => {
    mockedPinecone.search.mockResolvedValue([{ content: 'Relay docs', source: 'manual' }])

    await ChatService.query('Bagaimana cara relay bekerja?')

    expect(mockInvoke).toHaveBeenCalledWith({
      messages: [
        expect.objectContaining({
          role: 'human',
          content: expect.stringContaining('[Context from knowledge base]')
        })
      ]
    })
  })

  it('returns reply with audio when withAudio is true', async () => {
    mockedTTS.synthesizeSpeech.mockResolvedValue({
      mimeType: 'audio/mpeg',
      base64: 'abc',
      byteLength: 3,
      speakText: 'Lampu sudah dinyalakan.'
    })

    const result = await ChatService.query('Nyalakan lampu', { withAudio: true })

    expect(result.reply).toBe('Lampu sudah dinyalakan.')
    expect(result.audio).toEqual({
      mimeType: 'audio/mpeg',
      base64: 'abc',
      byteLength: 3,
      speakText: 'Lampu sudah dinyalakan.'
    })
  })

  it('wraps unexpected errors', async () => {
    mockInvoke.mockRejectedValue(new Error('agent failed'))

    await expect(ChatService.query('Hello')).rejects.toMatchObject({
      message: 'Failed to process chat query with user message',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})
