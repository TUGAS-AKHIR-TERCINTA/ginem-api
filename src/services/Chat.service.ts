import { StatusCodes } from 'http-status-codes'
import { createAgent } from 'langchain'

import logger from '../../logs'
import { AppError } from '../utilities/AppError'
import { LLMService } from './LLM.service'
import { deviceTools } from './mcp/tools/index'
import { PineconeService } from './Pinecone.service'

const DEVICE_CHAT_SYSTEM_PROMPT = `You are a helpful assistant with access to device data from the database and a knowledge base (RAG). When the user asks a question, you may receive relevant context from the knowledge base above the user message—use it to answer when applicable, combined with tool results.

You have tools to:
- list_devices: List devices with optional pagination (page, size).
- get_device_by_id: Get a single device by its numeric deviceId.
- get_last_log_by_device_name: Get the latest single log for a device by its name (deviceName).
- get_last_10_logs_by_device_name: Get the last 10 logs (most recent first) for a device by its name (deviceName).
- create_device_log: Create a new device log for a device; use deviceName and deviceLogData. Do NOT use for turn on/off — use set_actuator_state_by_device_name.
- set_actuator_state_by_device_name: Turn ON or OFF an actuator by device name. Use when the user says "hidupkan (nama device)", "matikan (nama device)", turn on, turn off, nyalakan, padamkan. Only works for devices with deviceType "actuator". On → value 1, off → value 0.
- schedule_actuator_state_after_minutes: Schedule turning ON or OFF an actuator after a delay in minutes. Use when the user says "hidupkan Smart Lamp 1 menit lagi", "matikan AC 5 menit lagi", "tolong hidupin device X di Y menit lagi", "turn on (device) in N minutes". Returns a jobId.
- schedule_sensor_data_after_minutes: Schedule fetching sensor/device data after a delay in minutes. Use when the user says "kasih data sensor A 5 menit lagi", "tolong kasih data sensor X Y menit lagi", "give me sensor data in 5 minutes". Returns a jobId; after the delay the user can get the result with get_scheduled_job_result(jobId).
- get_scheduled_job_result: Get the status and result of a scheduled job by jobId. Use when the user asks for the result of a scheduled task, or after a scheduled sensor data job has run (user can call this with the jobId to get the data).
- list_scheduled_jobs: List recent scheduled jobs (pending, completed, failed).

For "X menit lagi" / "in N minutes" instructions: use schedule_actuator_state_after_minutes for turn on/off, or schedule_sensor_data_after_minutes for "kasih data". Tell the user the jobId so they can get the result later with get_scheduled_job_result if needed.
Answer in a clear, concise way based on the tool results. If no data is found or device is not an actuator, say so.`

/**
 * Chat layer: LLM + device MCP tools + optional Pinecone RAG context.
 */
export class ChatService {
  private static agent = createAgent({
    model: LLMService.create(),
    tools: deviceTools,
    systemPrompt: DEVICE_CHAT_SYSTEM_PROMPT
  })

  /**
   * Run a chat turn with a user message. Injects Pinecone knowledge chunks when available.
   *
   * @param userMessage - Natural language question (devices or knowledge base)
   * @returns Final assistant message content (string)
   */
  static async query(userMessage: string): Promise<string> {
    try {
      let messageToSend = userMessage

      const ragHits = await PineconeService.searchKnowledgeChunks(userMessage, 5)
      if (ragHits.length > 0) {
        const contextBlock = ragHits.map((h) => h.text).join('\n\n')
        messageToSend = `[Context from knowledge base]\n${contextBlock}\n\n[User question]\n${userMessage}`
      }

      const result = await ChatService.agent.invoke({
        messages: [{ role: 'human', content: messageToSend }]
      })

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
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`[ChatService] query failed: ${String(error)}`)
      throw new AppError(
        'Failed to process chat query',
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    }
  }
}
