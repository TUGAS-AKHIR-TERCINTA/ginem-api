import { createAgent } from 'langchain'
import { LLMService } from '../LLMServices'
import { deviceTools } from './tools/device.tools'

const DEVICE_AGENT_SYSTEM_PROMPT = `You are a helpful assistant with access to device data from the database.

You have tools to:
- list_devices: List devices with optional pagination (page, size).
- get_device_by_id: Get a single device by its numeric deviceId.

Use these tools when the user asks about devices, device list, device details, or a specific device by ID.
Answer in a clear, concise way based on the tool results. If no data is found, say so.`

/**
 * MCP-backed agent for device domain.
 * Uses LLM + device tools to answer natural language queries about devices.
 */
export class DeviceAgentService {
  private static agent = createAgent({
    model: LLMService.create(),
    tools: deviceTools,
    systemPrompt: DEVICE_AGENT_SYSTEM_PROMPT
  })

  /**
   * Run the device agent with a user message.
   * The agent may call list_devices and/or get_device_by_id, then reply using the LLM.
   *
   * @param userMessage - Natural language question about devices (e.g. "List all devices", "Get device with ID 5")
   * @returns Final assistant message content (string)
   */
  static async query(userMessage: string): Promise<string> {
    const result = await DeviceAgentService.agent.invoke({
      messages: [{ role: 'human', content: userMessage }]
    })

    const lastMessage = result.messages?.at(-1)
    const content = lastMessage?.content
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      const textPart = content.find((c: { type?: string; text?: string }) => c.type === 'text')
      return (textPart as { text?: string })?.text ?? JSON.stringify(content)
    }
    return content != null ? String(content) : JSON.stringify(result)
  }
}
