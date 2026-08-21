import { StatusCodes } from 'http-status-codes'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
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

export const DEVICE_CHAT_SYSTEM_PROMPT = `You are a helpful assistant with access to device data from the database and a knowledge base (RAG). When the user asks a question, you may receive relevant context from the knowledge base above the user message—use it to answer when applicable, combined with tool results.

You may also receive recent conversation history. Use it to stay consistent with prior turns (names, devices, preferences) without repeating yourself unnecessarily.

You have tools to:
- list_devices: List devices with optional pagination (page, size).
- get_device_by_id: Get a single device by its numeric deviceId.
- get_last_log_by_device_name: Get the latest single log for a device by its name (deviceName).
- get_last_10_logs_by_device_name: Get the last 10 logs (most recent first) for a device by its name (deviceName).
- create_device_log: Create a new device log for a device; use deviceName and deviceLogData. Do NOT use for turn on/off — use set_actuator_state_by_device_name.
- set_actuator_state_by_device_name: Turn ON or OFF an actuator by device name IMMEDIATELY. Use when the user says "hidupkan (nama device)", "matikan (nama device)", turn on, turn off, nyalakan, padamkan RIGHT NOW. Only works for devices with deviceType "actuator" or "hybrid". On → value 1, off → value 0.
- schedule_actuator_state_at: Schedule actuator ON/OFF once or daily repeat (WIB). Use category once for one-time, repeat for every day at hour:minute.
- schedule_sensor_data_at: Schedule sensor data fetch once or daily repeat (WIB).
- get_scheduled_job_result: Get the status and result of a scheduled job by jobId.
- list_scheduled_jobs: List recent scheduled jobs (pending, active, completed, failed).
- create_automation_rule: Create an Event-Condition-Action automation so devices cooperate automatically (e.g. "hidupkan kipas jika suhu di atas 25"). Trigger device must be sensor/hybrid; action device(s) must be actuator/hybrid. Stores the rule; Rule Engine executes later on MQTT telemetry without calling the LLM again. Always set originalPrompt to the user message.
- list_automation_rules / get_automation_rule / set_automation_rule_active / delete_automation_rule: Manage stored automation rules.

Important distinctions:
- Immediate control → set_actuator_state_by_device_name
- Time-based schedule → schedule_*
- Condition-based automation between devices (jika/jika suhu/jika kelembaban/otomatis) → create_automation_rule

Answer in a clear, concise way based on the tool results. If no data is found or device is not an actuator, say so.

When the user may hear the reply as voice: respond in natural spoken Indonesian (1–4 short sentences). Do NOT use markdown, bullet lists, tables, or raw JSON in the final answer.`

export interface ChatToolCallTrace {
  name: string
  args: Record<string, unknown>
  id?: string
}

export interface ChatTokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface ChatQueryTrace {
  toolCalls: ChatToolCallTrace[]
  /** Wall time for agent.invoke only (ms). */
  agentLatencyMs: number
  /** Summed across every LLM call made during this agent run, when providers report it. */
  tokenUsage?: ChatTokenUsage
}

export interface ChatQueryResponse {
  reply: string
  audio?: ChatAudioPayload
  /** Present only when `captureTrace` is true. */
  trace?: ChatQueryTrace
}

export interface ChatQueryOptions {
  withAudio?: boolean
  userId?: number
  sessionId?: string
  source?: ChatMessageSource
  /**
   * Optional model override (evaluation / experiments).
   * When omitted, the production default agent model is used.
   */
  model?: BaseChatModel
  /**
   * When true, response includes tool-call trace from the agent run.
   * Does not change tool execution behavior.
   */
  captureTrace?: boolean
}

type AgentInvokeResult = {
  messages?: Array<{
    content?: unknown
    tool_calls?: unknown
    additional_kwargs?: unknown
    usage_metadata?: unknown
  }>
}

type AgentLike = {
  invoke: (input: {
    messages: Array<{ role: 'human' | 'assistant'; content: string }>
  }) => Promise<AgentInvokeResult>
}

/**
 * Chat layer: LLM + short-term MySQL memory + device tools + Pinecone RAG + optional TTS.
 */
export class ChatService {
  private static readonly defaultAgent = createAgent({
    model: LLMService.create(),
    tools: deviceTools,
    systemPrompt: DEVICE_CHAT_SYSTEM_PROMPT
  }) as AgentLike

  /**
   * Run a chat turn. When `withAudio` is true, synthesizes reply audio via OpenAI TTS.
   * When `userId` + `sessionId` are provided, loads/saves short-term chat memory.
   * Optional `model` / `captureTrace` support evaluation without changing default behavior.
   */
  static async query(
    userMessage: string,
    options?: ChatQueryOptions
  ): Promise<ChatQueryResponse> {
    try {
      const { reply, trace } = await ChatService.generateReply(userMessage, options)

      if (options?.withAudio !== true) {
        return trace != null ? { reply, trace } : { reply }
      }

      const audio = await TTSService.synthesizeSpeech(reply)
      return trace != null ? { reply, audio, trace } : { reply, audio }
    } catch (serviceError) {
      if (serviceError instanceof AppError) throw serviceError
      logger.error(`[ChatService] query failed: ${String(serviceError)}`)
      throw new AppError(
        'Failed to process chat query with user message',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }

  private static resolveAgent(options?: ChatQueryOptions): AgentLike {
    if (options?.model == null) {
      return ChatService.defaultAgent
    }
    return createAgent({
      model: options.model,
      tools: deviceTools,
      systemPrompt: DEVICE_CHAT_SYSTEM_PROMPT
    }) as AgentLike
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
  ): Promise<{ reply: string; trace?: ChatQueryTrace }> {
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

    const agent = ChatService.resolveAgent(options)
    const startedAt = Date.now()
    const result = await agent.invoke({
      messages: ChatService.toAgentMessages(history, currentContent)
    })
    const agentLatencyMs = Date.now() - startedAt

    const reply = ChatService.extractReplyText(result)

    if (memoryScope != null) {
      try {
        await ChatMemoryService.appendTurn(memoryScope, userMessage, reply)
      } catch (memoryError) {
        // Do not fail the user-facing reply if persistence fails.
        logger.warn(`[ChatService] failed to persist chat memory: ${String(memoryError)}`)
      }
    }

    if (options?.captureTrace !== true) {
      return { reply }
    }

    const tokenUsage = ChatService.extractTokenUsage(result.messages ?? [])

    return {
      reply,
      trace: {
        toolCalls: ChatService.extractToolCalls(result.messages ?? []),
        agentLatencyMs,
        ...(tokenUsage != null && { tokenUsage })
      }
    }
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

  /**
   * Collect tool calls from agent message history (AI / tool-call messages).
   */
  static extractToolCalls(
    messages: Array<{
      content?: unknown
      tool_calls?: unknown
      additional_kwargs?: unknown
    }>
  ): ChatToolCallTrace[] {
    const calls: ChatToolCallTrace[] = []

    for (const message of messages) {
      const direct = message.tool_calls
      let messageHadDirectCall = false
      if (Array.isArray(direct)) {
        for (const tc of direct) {
          const item = tc as {
            name?: string
            args?: Record<string, unknown>
            id?: string
            function?: { name?: string; arguments?: string }
          }
          if (item.name) {
            calls.push({
              name: item.name,
              args: (item.args ?? {}) as Record<string, unknown>,
              id: item.id
            })
            messageHadDirectCall = true
            continue
          }
          if (item.function?.name) {
            let args: Record<string, unknown> = {}
            try {
              args = JSON.parse(item.function.arguments ?? '{}') as Record<
                string,
                unknown
              >
            } catch {
              args = {}
            }
            calls.push({ name: item.function.name, args, id: item.id })
            messageHadDirectCall = true
          }
        }
      }

      // `additional_kwargs.tool_calls` is the same provider payload LangChain already
      // normalizes into `message.tool_calls` above — only fall back to it when the
      // normalized array was empty, otherwise every call gets counted twice.
      if (messageHadDirectCall) continue

      const kwargs = message.additional_kwargs as
        | { tool_calls?: Array<Record<string, unknown>> }
        | undefined
      if (kwargs?.tool_calls && Array.isArray(kwargs.tool_calls)) {
        for (const tc of kwargs.tool_calls) {
          const fn = tc.function as { name?: string; arguments?: string } | undefined
          if (!fn?.name) continue
          let args: Record<string, unknown> = {}
          try {
            args = JSON.parse(fn.arguments ?? '{}') as Record<string, unknown>
          } catch {
            args = {}
          }
          calls.push({
            name: fn.name,
            args,
            id: typeof tc.id === 'string' ? tc.id : undefined
          })
        }
      }
    }

    return calls
  }

  /**
   * Sums provider-reported usage_metadata across every AI message in the run
   * (an agent turn may call the model more than once before the final reply).
   * Returns undefined when no message carries usage data (provider didn't report it).
   */
  static extractTokenUsage(
    messages: Array<{ usage_metadata?: unknown }>
  ): ChatTokenUsage | undefined {
    let inputTokens = 0
    let outputTokens = 0
    let totalTokens = 0
    let found = false

    for (const message of messages) {
      const usage = message.usage_metadata as
        | { input_tokens?: number; output_tokens?: number; total_tokens?: number }
        | undefined
      if (usage == null) continue
      found = true
      inputTokens += usage.input_tokens ?? 0
      outputTokens += usage.output_tokens ?? 0
      totalTokens +=
        usage.total_tokens ?? (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)
    }

    return found ? { inputTokens, outputTokens, totalTokens } : undefined
  }
}
