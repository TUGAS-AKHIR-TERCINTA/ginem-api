import { StatusCodes } from 'http-status-codes'

import { createAgent } from 'langchain'
import { ChatService } from '../Chat.service'
import { ChatMemoryService } from '../ChatMemory.service'
import { pineconeService } from '../../rag'
import { TTSService } from '../TTS.service'

jest.mock('langchain', () => ({
  createAgent: jest.fn(() => ({
    invoke: jest.fn()
  }))
}))

jest.mock('../../llm', () => ({
  LLMService: { create: jest.fn(() => ({ id: 'default-model' })) }
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

jest.mock('../ChatMemory.service', () => ({
  ChatMemoryService: {
    getRecent: jest.fn(),
    appendTurn: jest.fn()
  }
}))

jest.mock('../../mcp/tools/index', () => ({
  deviceTools: []
}))

jest.mock('../../../utilities/logger', () => ({
  __esModule: true,
  default: { error: jest.fn(), info: jest.fn(), warn: jest.fn() }
}))

const createAgentMock = createAgent as jest.Mock
const defaultInvoke = createAgentMock.mock.results[0].value.invoke as jest.Mock
const mockedPinecone = pineconeService as jest.Mocked<typeof pineconeService>
const mockedTTS = TTSService as jest.Mocked<typeof TTSService>
const mockedMemory = ChatMemoryService as jest.Mocked<typeof ChatMemoryService>

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedPinecone.search.mockResolvedValue([])
    mockedMemory.getRecent.mockResolvedValue([])
    mockedMemory.appendTurn.mockResolvedValue(undefined)
    defaultInvoke.mockResolvedValue({
      messages: [{ content: 'Lampu sudah dinyalakan.' }]
    })
  })

  it('returns text reply without audio by default', async () => {
    const result = await ChatService.query('Nyalakan lampu')

    expect(result).toEqual({ reply: 'Lampu sudah dinyalakan.' })
    expect(mockedTTS.synthesizeSpeech).not.toHaveBeenCalled()
    expect(mockedMemory.getRecent).not.toHaveBeenCalled()
    expect(mockedMemory.appendTurn).not.toHaveBeenCalled()
  })

  it('includes RAG context when pinecone returns hits', async () => {
    mockedPinecone.search.mockResolvedValue([{ content: 'Relay docs', source: 'manual' }])

    await ChatService.query('Bagaimana cara relay bekerja?')

    expect(defaultInvoke).toHaveBeenCalledWith({
      messages: [
        expect.objectContaining({
          role: 'human',
          content: expect.stringContaining('[Context from knowledge base]')
        })
      ]
    })
  })

  it('loads recent memory and persists the turn when scoped', async () => {
    mockedMemory.getRecent.mockResolvedValue([
      { role: 'user', content: 'Halo' },
      { role: 'assistant', content: 'Halo, ada yang bisa dibantu?' }
    ])

    await ChatService.query('Nyalakan lampu', {
      userId: 7,
      sessionId: 'web:7',
      source: 'web'
    })

    expect(mockedMemory.getRecent).toHaveBeenCalledWith({
      userId: 7,
      sessionId: 'web:7'
    })
    expect(defaultInvoke).toHaveBeenCalledWith({
      messages: [
        { role: 'human', content: 'Halo' },
        { role: 'assistant', content: 'Halo, ada yang bisa dibantu?' },
        { role: 'human', content: 'Nyalakan lampu' }
      ]
    })
    expect(mockedMemory.appendTurn).toHaveBeenCalledWith(
      { userId: 7, sessionId: 'web:7', source: 'web' },
      'Nyalakan lampu',
      'Lampu sudah dinyalakan.'
    )
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

  it('uses an override model agent when model is provided', async () => {
    const overrideInvoke = jest.fn().mockResolvedValue({
      messages: [{ content: 'Override reply' }]
    })
    createAgentMock.mockReturnValueOnce({ invoke: overrideInvoke })

    const overrideModel = { id: 'override' } as never
    const result = await ChatService.query('Nyalakan lampu', {
      model: overrideModel
    })

    expect(createAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: overrideModel })
    )
    expect(overrideInvoke).toHaveBeenCalled()
    expect(defaultInvoke).not.toHaveBeenCalled()
    expect(result.reply).toBe('Override reply')
  })

  it('returns tool-call trace when captureTrace is true', async () => {
    defaultInvoke.mockResolvedValue({
      messages: [
        {
          content: '',
          tool_calls: [
            {
              name: 'set_actuator_state_by_device_name',
              args: { deviceName: 'Smart Lamp Bedroom', state: 'on' },
              id: 'call-1'
            }
          ]
        },
        { content: 'Lampu sudah dinyalakan.' }
      ]
    })

    const result = await ChatService.query('Nyalakan lampu', {
      captureTrace: true
    })

    expect(result.reply).toBe('Lampu sudah dinyalakan.')
    expect(result.trace?.toolCalls).toEqual([
      {
        name: 'set_actuator_state_by_device_name',
        args: { deviceName: 'Smart Lamp Bedroom', state: 'on' },
        id: 'call-1'
      }
    ])
    expect(result.trace?.agentLatencyMs).toBeGreaterThanOrEqual(0)
  })

  it('sums token usage across every AI message when captureTrace is true', async () => {
    defaultInvoke.mockResolvedValue({
      messages: [
        {
          content: '',
          tool_calls: [
            { name: 'set_actuator_state_by_device_name', args: {}, id: 'call-1' }
          ],
          usage_metadata: { input_tokens: 100, output_tokens: 20, total_tokens: 120 }
        },
        {
          content: 'Lampu sudah dinyalakan.',
          usage_metadata: { input_tokens: 130, output_tokens: 15, total_tokens: 145 }
        }
      ]
    })

    const result = await ChatService.query('Nyalakan lampu', { captureTrace: true })

    expect(result.trace?.tokenUsage).toEqual({
      inputTokens: 230,
      outputTokens: 35,
      totalTokens: 265
    })
  })

  it('omits tokenUsage when provider does not report usage_metadata', async () => {
    const result = await ChatService.query('Nyalakan lampu', { captureTrace: true })

    expect(result.trace?.tokenUsage).toBeUndefined()
  })

  it('wraps unexpected errors', async () => {
    defaultInvoke.mockRejectedValue(new Error('agent failed'))

    await expect(ChatService.query('Hello')).rejects.toMatchObject({
      message: 'Failed to process chat query with user message',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    })
  })
})
