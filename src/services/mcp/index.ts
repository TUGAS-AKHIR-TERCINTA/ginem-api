/**
 * MCP (Model Context Protocol) services.
 * Tools and agents that expose app data to LLM via tool-calling.
 */

export { DeviceAgentService } from './DeviceAgent.service'
export { listDevicesTool, getDeviceByIdTool, deviceTools } from './tools'
