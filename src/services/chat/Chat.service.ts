import { StatusCodes } from 'http-status-codes'
import { createAgent } from 'langchain'

import logger from '../../utilities/logger'
import { AppError } from '../../utilities/AppError'
import { LLMService } from '../llm'
import { TTSService, type ChatAudioPayload } from './TTS.service'
import {
  ChatMemoryService,
  type ChatMemoryScope,
  type ChatMemoryTurn
} from './ChatMemory.service'
import { deviceTools } from '../mcp/tools/index'
import { pineconeService, type RagDocument } from '../rag'
import type { ChatMessageSource } from '../../models/ChatMessageModel'

const DEVICE_CHAT_SYSTEM_PROMPT = `You are a helpful assistant with access to device data from the database and a knowledge base (RAG). When the user asks a question, you may receive relevant context from the knowledge base above the user message—use it to answer when applicable, combined with tool results.

You may also receive recent conversation history. Use it to stay consistent with prior turns (names, devices, preferences) without repeating yourself unnecessarily.

You have tools to:
- list_devices: List devices with optional pagination (page, size).
- get_device_by_id: Get a single device by its numeric deviceId.
- get_last_log_by_device_name: Get the latest single log for a device by its name (deviceName).
- get_last_10_logs_by_device_name: Get the last 10 logs (most recent first) for a device by its name (deviceName).
- create_device_log: Create a new device log for a device; use deviceName and deviceLogData. Do NOT use for turn on/off — use set_actuator_state_by_device_name.
- set_actuator_state_by_device_name: Turn ON or OFF an actuator by device name. Use when the user says "hidupkan (nama device)", "matikan (nama device)", turn on, turn off, nyalakan, padamkan. Only works for devices with deviceType "actuator". On → value 1, off → value 0.
- schedule_actuator_state_at: Schedule actuator ON/OFF once or daily repeat (WIB). Use category once for one-time, repeat for every day at hour:minute.
- schedule_sensor_data_at: Schedule sensor data fetch once or daily repeat (WIB).
- get_scheduled_job_result: Get the status and result of a scheduled job by jobId.
- list_scheduled_jobs: List recent scheduled jobs (pending, active, completed, failed).

Answer in a clear, concise way based on the tool results. If no data is found or device is not an actuator, say so.

When the user may hear the reply as voice: respond in natural spoken Indonesian (1–4 short sentences). Do NOT use markdown, bullet lists, tables, or raw JSON in the final answer.`

export interface ChatQueryResponse {
  reply: string
  audio?: ChatAudioPayload
}

export interface ChatQueryOptions {
  withAudio?: boolean
  userId?: number
  sessionId?: string
  source?: ChatMessageSource
}

/**
 * Chat layer: LLM + short-term MySQL memory + device tools + Pinecone RAG + optional TTS.
 */
export class ChatService {
  private static readonly agent = createAgent({
    model: LLMService.create(),
    tools: deviceTools,
    systemPrompt: DEVICE_CHAT_SYSTEM_PROMPT
  })

  /**
   * Run a chat turn. When `withAudio` is true, synthesizes reply audio via OpenAI TTS.
   * When `userId` + `sessionId` are provided, loads/saves short-term chat memory.
   */
  static async query(
    userMessage: string,
    options?: ChatQueryOptions
  ): Promise<ChatQueryResponse> {
    try {
      const reply = await ChatService.generateReply(userMessage, options)

      if (options?.withAudio !== true) {
        return { reply }
      }

      const audio = await TTSService.synthesizeSpeech(reply)
      return { reply, audio }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatService] query failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to process chat query with user message',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private static resolveMemoryScope(options?: ChatQueryOptions): ChatMemoryScope | null {
    if (
      options?.userId == null ||
      options.sessionId == null ||
      options.sessionId === ''
    ) {
      return null
    }
    return {
      userId: options.userId,
      sessionId: options.sessionId,
      source: options.source ?? 'web'
    }
  }

  private static toAgentMessages(
    history: ChatMemoryTurn[],
    currentUserContent: string
  ): Array<{ role: 'human' | 'assistant'; content: string }> {
    const prior = history.map((turn) => ({
      role: (turn.role === 'user' ? 'human' : 'assistant') as 'human' | 'assistant',
      content: turn.content
    }))
    return [...prior, { role: 'human', content: currentUserContent }]
  }

  private static async generateReply(
    userMessage: string,
    options?: ChatQueryOptions
  ): Promise<string> {
    const memoryScope = ChatService.resolveMemoryScope(options)
    const history =
      memoryScope != null
        ? await ChatMemoryService.getRecent({
            userId: memoryScope.userId,
            sessionId: memoryScope.sessionId
          })
        : []

    let currentContent = userMessage

    const ragHits = await pineconeService.search(userMessage, 5)
    if (ragHits.length > 0) {
      const contextBlock = ragHits.map((h: RagDocument) => h.content).join('\n\n')
      currentContent = `[Context from knowledge base]\n${contextBlock}\n\n[User question]\n${userMessage}`
    }

    const result = await ChatService.agent.invoke({
      messages: ChatService.toAgentMessages(history, currentContent)
    })

    const reply = ChatService.extractReplyText(result)

    if (memoryScope != null) {
      try {
        await ChatMemoryService.appendTurn(memoryScope, userMessage, reply)
      } catch (memoryError) {
        // Do not fail the user-facing reply if persistence fails.
        logger.warn(`[ChatService] failed to persist chat memory: ${String(memoryError)}`)
      }
    }

    return reply
  }

  private static extractReplyText(result: {
    messages?: Array<{ content?: unknown }>
  }): string {
    const lastMessage = result.messages?.at(-1)
    const content = lastMessage?.content
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      const textPart = content.find(
        (c: { type?: string; text?: string }) => c.type === 'text'
      )
      return (textPart as { text?: string })?.text ?? JSON.stringify(content)
    }

    return content != null ? String(content) : JSON.stringify(result)
  }
}
